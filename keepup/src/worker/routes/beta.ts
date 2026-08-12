// 베타테스터 신청 API
// Play 비공개 테스트는 테스터의 '구글 계정 이메일'을 콘솔에 등록해야 참여가 된다.
// 그래서 신청은 로그인 계정의 이메일을 그대로 쓰고, 이메일이 없는 계정(카카오·네이버 등)은 막는다.
// 이메일은 개인정보이므로 목록 조회는 관리자만 가능하고, 공개 응답에는 절대 담지 않는다.
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { betaTesters, users } from "../../db/schema";
import type { Env } from "../types";
import { ok, err } from "../types";
import { requireLogin, type AuthedUser } from "../middleware";
import { readSession } from "../session";

const applySchema = z.object({
  device: z.string().trim().max(60).optional(),
  note: z.string().trim().max(500).optional(),
  // 개인정보(구글 계정 이메일) 수집·이용 동의 — 화면의 체크박스를 우회해도 서버에서 막는다.
  // 동의 시각은 별도 컬럼을 두지 않고 createdAt(신청 시각)으로 갈음한다.
  agreed: z.literal(true),
});

const statusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export const betaRoutes = new Hono<{ Bindings: Env; Variables: { user: AuthedUser } }>();

/** 모집 현황 — 누구나. 숫자만 주고 개인정보는 담지 않는다 */
betaRoutes.get("/beta/stats", async (c) => {
  const db = drizzle(c.env.DB);
  const [row] = await db
    .select({
      total: sql<number>`count(*)`,
      approved: sql<number>`sum(case when ${betaTesters.status} = 'approved' then 1 else 0 end)`,
    })
    .from(betaTesters);
  return c.json(ok({ total: row?.total ?? 0, approved: row?.approved ?? 0 }));
});

/** 내 신청 상태 — 로그인했을 때만 의미가 있다 */
betaRoutes.get("/beta/me", async (c) => {
  const sess = await readSession(c);
  if (!sess) return c.json(ok({ loggedIn: false, canApply: false, application: null }));

  const db = drizzle(c.env.DB);
  const [me] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, sess.userId))
    .limit(1);
  const [app] = await db
    .select({
      id: betaTesters.id,
      device: betaTesters.device,
      note: betaTesters.note,
      status: betaTesters.status,
      createdAt: betaTesters.createdAt,
    })
    .from(betaTesters)
    .where(eq(betaTesters.userId, sess.userId))
    .limit(1);

  return c.json(
    ok({
      loggedIn: true,
      // 구글 계정 이메일이 있어야 Play 테스터로 등록할 수 있다
      email: me?.email ?? null,
      canApply: Boolean(me?.email),
      application: app ?? null,
    }),
  );
});

/** 신청 — 로그인 필수, 1인 1회 */
betaRoutes.post("/beta/apply", requireLogin(), async (c) => {
  const parsed = applySchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) {
    const noConsent = parsed.error.issues.some((i) => i.path[0] === "agreed");
    return c.json(err(noConsent ? "consent_required" : "invalid_input"), 400);
  }

  const db = drizzle(c.env.DB);
  const uid = c.get("user").id;

  const [me] = await db.select({ email: users.email }).from(users).where(eq(users.id, uid)).limit(1);
  if (!me?.email) return c.json(err("email_required"), 400);

  const existing = await db
    .select({ id: betaTesters.id })
    .from(betaTesters)
    .where(eq(betaTesters.userId, uid))
    .limit(1);
  if (existing.length > 0) return c.json(err("already_applied"), 409);

  await db.insert(betaTesters).values({
    userId: uid,
    email: me.email,
    device: parsed.data.device || null,
    note: parsed.data.note || null,
    createdAt: new Date(),
  });
  return c.json(ok({ applied: true }));
});

/** 신청 취소 — 본인 */
betaRoutes.delete("/beta/apply", requireLogin(), async (c) => {
  const db = drizzle(c.env.DB);
  await db.delete(betaTesters).where(eq(betaTesters.userId, c.get("user").id));
  return c.json(ok({ canceled: true }));
});

/** 신청 목록 — 관리자만 (이메일 포함) */
betaRoutes.get("/beta", requireLogin(), async (c) => {
  if (c.get("user").role !== "admin") return c.json(err("forbidden"), 403);
  const db = drizzle(c.env.DB);
  const rows = await db
    .select({
      id: betaTesters.id,
      email: betaTesters.email,
      device: betaTesters.device,
      note: betaTesters.note,
      status: betaTesters.status,
      createdAt: betaTesters.createdAt,
      name: users.name,
    })
    .from(betaTesters)
    .innerJoin(users, eq(betaTesters.userId, users.id))
    .orderBy(desc(betaTesters.id));
  return c.json(ok({ testers: rows }));
});

/** 상태 변경 — 관리자만 */
betaRoutes.patch("/beta/:id", requireLogin(), async (c) => {
  if (c.get("user").role !== "admin") return c.json(err("forbidden"), 403);
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json(err("invalid_id"), 400);
  const parsed = statusSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json(err("invalid_input"), 400);

  const db = drizzle(c.env.DB);
  await db.update(betaTesters).set({ status: parsed.data.status }).where(eq(betaTesters.id, id));
  return c.json(ok({ updated: true }));
});
