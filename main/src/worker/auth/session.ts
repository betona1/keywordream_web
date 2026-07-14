// 세션 — KV 저장 + 쿠키. COOKIE_DOMAIN(.keywordream.com)으로 발급해
// keepup.keywordream.com 서브도메인 Worker와 세션을 공유한다(SSO).
import type { Context } from "hono";
import type { Env as HonoEnv } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Env, SessionUser } from "../types";

const COOKIE = "session";
const TTL_SECONDS = 30 * 24 * 60 * 60; // 30일

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function cookieOpts(env: Env) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "Lax" as const,
    path: "/",
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

/// KV에 세션 레코드만 생성하고 토큰을 반환 (쿠키 미발급 — 앱 토큰 용도)
export async function createSessionToken(
  env: Env,
  user: SessionUser,
  ttlSeconds: number = TTL_SECONDS,
): Promise<string> {
  const token = randomToken();
  await env.SESSIONS.put(`sess:${token}`, JSON.stringify(user), {
    expirationTtl: ttlSeconds,
  });
  return token;
}

export async function createSession<E extends HonoEnv & { Bindings: Env }>(
  c: Context<E>,
  user: SessionUser,
): Promise<void> {
  const token = await createSessionToken(c.env, user);
  setCookie(c, COOKIE, token, { ...cookieOpts(c.env), maxAge: TTL_SECONDS });
}

export async function readSession<E extends HonoEnv & { Bindings: Env }>(
  c: Context<E>,
): Promise<SessionUser | null> {
  const token = getCookie(c, COOKIE);
  if (!token) return null;
  const raw = await c.env.SESSIONS.get(`sess:${token}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export async function destroySession<E extends HonoEnv & { Bindings: Env }>(
  c: Context<E>,
): Promise<void> {
  const token = getCookie(c, COOKIE);
  if (token) await c.env.SESSIONS.delete(`sess:${token}`);
  deleteCookie(c, COOKIE, {
    path: "/",
    ...(c.env.COOKIE_DOMAIN ? { domain: c.env.COOKIE_DOMAIN } : {}),
  });
}
