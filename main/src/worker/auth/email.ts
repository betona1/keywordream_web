// 이메일 간편로그인 — 비밀번호 없는 6자리 인증코드 방식 (패스워드리스)
// 발송은 Resend HTTP API 사용 (RESEND_API_KEY 미설정 시 기능 비활성)
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { users } from "../../db/schema";
import type { Env, Role } from "../types";
import { ok, err } from "../types";
import { createSession } from "./session";
import { verifyTurnstile } from "../turnstile";

const CODE_TTL = 600; // 10분
const MAX_SENDS_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;

const startSchema = z.object({
  email: z.string().email().max(200),
  turnstileToken: z.string().optional(),
});
const verifySchema = z.object({
  email: z.string().email().max(200),
  code: z.string().regex(/^\d{6}$/),
});

function normalize(email: string) {
  return email.trim().toLowerCase();
}

async function sendCodeEmail(env: Env, to: string, code: string): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // 발신 주소는 Resend에 인증된 도메인이어야 한다 (현재 exansys.net 계정 공용 — EMAIL_FROM으로 교체 가능)
      from: env.EMAIL_FROM || "keywordream <login@keywordream.com>",
      to: [to],
      subject: `[keywordream] 로그인 인증코드 ${code}`,
      html: `<div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:24px">
        <h2 style="color:#4C6EF5">keywordream 로그인</h2>
        <p>아래 6자리 코드를 10분 안에 입력해 주세요.</p>
        <p style="font-size:32px;font-weight:800;letter-spacing:8px;color:#1c2333">${code}</p>
        <p style="color:#888;font-size:13px">본인이 요청하지 않았다면 이 메일을 무시하세요.</p>
      </div>`,
    }),
  });
  return res.ok;
}

export const emailAuthRoutes = new Hono<{ Bindings: Env }>();

/** 인증코드 발송 */
emailAuthRoutes.post("/start", async (c) => {
  if (!c.env.RESEND_API_KEY) return c.json(err("email_login_not_configured"), 503);
  const parsed = startSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json(err("invalid_email"), 400);

  const human = await verifyTurnstile(
    c.env,
    parsed.data.turnstileToken,
    c.req.header("CF-Connecting-IP"),
  );
  if (!human) return c.json(err("turnstile_failed"), 400);

  const email = normalize(parsed.data.email);

  // 시간당 발송 횟수 제한 (스팸/비용 방지)
  const rlKey = `otp-rl:${email}`;
  const sent = Number((await c.env.SESSIONS.get(rlKey)) ?? "0");
  if (sent >= MAX_SENDS_PER_HOUR) return c.json(err("too_many_requests"), 429);
  await c.env.SESSIONS.put(rlKey, String(sent + 1), { expirationTtl: 3600 });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await c.env.SESSIONS.put(
    `otp:${email}`,
    JSON.stringify({ code, attempts: 0 }),
    { expirationTtl: CODE_TTL },
  );

  const delivered = await sendCodeEmail(c.env, email, code);
  if (!delivered) return c.json(err("send_failed"), 502);
  return c.json(ok({ sent: true }));
});

/** 인증코드 확인 → 로그인 */
emailAuthRoutes.post("/verify", async (c) => {
  const parsed = verifySchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json(err("invalid_input"), 400);
  const email = normalize(parsed.data.email);

  const key = `otp:${email}`;
  const raw = await c.env.SESSIONS.get(key);
  if (!raw) return c.json(err("code_expired"), 400);
  const rec = JSON.parse(raw) as { code: string; attempts: number };

  if (rec.attempts >= MAX_VERIFY_ATTEMPTS) {
    await c.env.SESSIONS.delete(key);
    return c.json(err("too_many_attempts"), 429);
  }
  if (rec.code !== parsed.data.code) {
    rec.attempts += 1;
    await c.env.SESSIONS.put(key, JSON.stringify(rec), { expirationTtl: CODE_TTL });
    return c.json(err("wrong_code"), 400);
  }
  await c.env.SESSIONS.delete(key);

  const isSeedAdmin = email === c.env.ADMIN_EMAIL.toLowerCase();
  const db = drizzle(c.env.DB);
  const found = await db
    .select()
    .from(users)
    .where(and(eq(users.provider, "email"), eq(users.providerId, email)))
    .limit(1);

  let userId: number;
  let role: Role;
  const displayName = email.split("@")[0];
  if (found.length === 0) {
    role = isSeedAdmin ? "admin" : "member";
    const inserted = await db
      .insert(users)
      .values({
        provider: "email",
        providerId: email,
        email,
        name: displayName,
        avatarUrl: null,
        role,
        createdAt: new Date(),
      })
      .returning({ id: users.id });
    userId = inserted[0].id;
  } else {
    userId = found[0].id;
    role = isSeedAdmin && found[0].role !== "admin" ? "admin" : (found[0].role as Role);
    // 탈퇴했던 계정 재활성화 + 역할 시드 반영
    await db.update(users).set({ role, deletedAt: null }).where(eq(users.id, userId));
  }

  await createSession(c, {
    userId,
    provider: "email",
    name: found[0]?.name ?? displayName,
    avatarUrl: null,
    role,
  });
  return c.json(ok({ loggedIn: true }));
});
