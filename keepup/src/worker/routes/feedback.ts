// 앱 개선사항 게시판 API — 버그·아이디어·질문을 올리고, 관리자가 처리 상태와 답변을 남긴다.
// 열람은 누구나, 작성은 로그인 필요(중복·스팸 방지). 상태/답변은 관리자만 바꾼다.
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { feedbackPosts, users } from "../../db/schema";
import type { Env } from "../types";
import { ok, err } from "../types";
import { requireLogin, type AuthedUser } from "../middleware";
import { readSession } from "../session";

const PAGE_SIZE = 20;

const createSchema = z.object({
  kind: z.enum(["bug", "idea", "question"]),
  title: z.string().trim().min(2).max(80),
  body: z.string().trim().min(5).max(3000),
  appVersion: z.string().trim().max(20).optional(),
  device: z.string().trim().max(60).optional(),
});

const adminSchema = z.object({
  status: z.enum(["open", "planned", "doing", "done", "wontfix"]).optional(),
  adminReply: z.string().trim().max(2000).optional(),
});

export const feedbackRoutes = new Hono<{ Bindings: Env; Variables: { user: AuthedUser } }>();

/** 목록 — 누구나. 열린 항목이 위로 오도록 상태별 가중치를 준다 */
feedbackRoutes.get("/feedback", async (c) => {
  const page = Math.max(1, Number(c.req.query("page") ?? "1") || 1);
  const db = drizzle(c.env.DB);
  const notDeleted = isNull(feedbackPosts.deletedAt);
  const sess = await readSession(c);

  const [rows, [countRow], [statRow]] = await Promise.all([
    db
      .select({
        id: feedbackPosts.id,
        kind: feedbackPosts.kind,
        title: feedbackPosts.title,
        body: feedbackPosts.body,
        appVersion: feedbackPosts.appVersion,
        device: feedbackPosts.device,
        status: feedbackPosts.status,
        adminReply: feedbackPosts.adminReply,
        repliedAt: feedbackPosts.repliedAt,
        createdAt: feedbackPosts.createdAt,
        authorId: users.id,
        authorName: users.name,
        authorAvatar: users.avatarUrl,
      })
      .from(feedbackPosts)
      .innerJoin(users, eq(feedbackPosts.userId, users.id))
      .where(notDeleted)
      .orderBy(desc(feedbackPosts.id))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ count: sql<number>`count(*)` }).from(feedbackPosts).where(notDeleted),
    db
      .select({
        total: sql<number>`count(*)`,
        done: sql<number>`sum(case when ${feedbackPosts.status} = 'done' then 1 else 0 end)`,
        replied: sql<number>`sum(case when ${feedbackPosts.adminReply} is not null then 1 else 0 end)`,
      })
      .from(feedbackPosts)
      .where(notDeleted),
  ]);

  return c.json(
    ok({
      items: rows.map((r) => ({
        id: r.id,
        kind: r.kind,
        title: r.title,
        body: r.body,
        appVersion: r.appVersion,
        device: r.device,
        status: r.status,
        adminReply: r.adminReply,
        repliedAt: r.repliedAt,
        createdAt: r.createdAt,
        author: { id: r.authorId, name: r.authorName, avatarUrl: r.authorAvatar },
        mine: sess ? sess.userId === r.authorId : false,
      })),
      total: countRow.count,
      page,
      pageSize: PAGE_SIZE,
      stats: {
        total: statRow?.total ?? 0,
        done: statRow?.done ?? 0,
        replied: statRow?.replied ?? 0,
      },
      canModerate: sess?.role === "admin",
    }),
  );
});

/** 작성 — 로그인 필수 */
feedbackRoutes.post("/feedback", requireLogin(), async (c) => {
  const parsed = createSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json(err("invalid_input"), 400);
  const db = drizzle(c.env.DB);
  const inserted = await db
    .insert(feedbackPosts)
    .values({
      userId: c.get("user").id,
      kind: parsed.data.kind,
      title: parsed.data.title,
      body: parsed.data.body,
      appVersion: parsed.data.appVersion || null,
      device: parsed.data.device || null,
      createdAt: new Date(),
    })
    .returning({ id: feedbackPosts.id });
  return c.json(ok({ id: inserted[0].id }));
});

/** 상태·답변 — 관리자만 */
feedbackRoutes.patch("/feedback/:id", requireLogin(), async (c) => {
  if (c.get("user").role !== "admin") return c.json(err("forbidden"), 403);
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json(err("invalid_id"), 400);
  const parsed = adminSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json(err("invalid_input"), 400);

  const patch: Record<string, unknown> = {};
  if (parsed.data.status) patch.status = parsed.data.status;
  if (parsed.data.adminReply !== undefined) {
    patch.adminReply = parsed.data.adminReply || null;
    patch.repliedAt = parsed.data.adminReply ? new Date() : null;
  }
  if (Object.keys(patch).length === 0) return c.json(err("nothing_to_update"), 400);

  const db = drizzle(c.env.DB);
  await db.update(feedbackPosts).set(patch).where(eq(feedbackPosts.id, id));
  return c.json(ok({ updated: true }));
});

/** 삭제 — 작성자 또는 관리자 (소프트 삭제) */
feedbackRoutes.delete("/feedback/:id", requireLogin(), async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json(err("invalid_id"), 400);
  const db = drizzle(c.env.DB);
  const [found] = await db
    .select({ userId: feedbackPosts.userId, deletedAt: feedbackPosts.deletedAt })
    .from(feedbackPosts)
    .where(eq(feedbackPosts.id, id))
    .limit(1);
  if (!found || found.deletedAt) return c.json(err("not_found"), 404);

  const u = c.get("user");
  if (found.userId !== u.id && u.role !== "admin") return c.json(err("forbidden"), 403);

  await db
    .update(feedbackPosts)
    .set({ deletedAt: new Date() })
    .where(and(eq(feedbackPosts.id, id), isNull(feedbackPosts.deletedAt)));
  return c.json(ok({ deleted: true }));
});
