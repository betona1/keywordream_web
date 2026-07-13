// 세션 읽기/파기 — main(keywordream.com)이 발급한 .keywordream.com 쿠키를
// 같은 KV(SESSIONS)에서 조회한다. 세션 '발급'은 main에서만 한다.
import type { Context } from "hono";
import type { Env as HonoEnv } from "hono";
import { getCookie, deleteCookie } from "hono/cookie";
import type { Env, SessionUser } from "./types";

const COOKIE = "session";

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
