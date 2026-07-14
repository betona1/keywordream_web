import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { drizzle } from "drizzle-orm/d1";
import { and, eq } from "drizzle-orm";
import { users } from "../../db/schema";
import type { Env, Role } from "../types";
import { ok, err } from "../types";
import { enabledProviders, getProvider, type ProviderName } from "./providers";
import {
  createSession,
  createSessionToken,
  destroySession,
  readSession,
} from "./session";
import { emailAuthRoutes } from "./email";

const STATE_COOKIE = "oauth_state";
const NEXT_COOKIE = "oauth_next";

function isProviderName(v: string): v is ProviderName {
  return v === "google" || v === "kakao" || v === "naver";
}

/** 로그인 후 복귀 URL 검증 — 우리 도메인(서브도메인 포함)과 로컬 개발만 허용 */
export function safeNext(env: Env, next: string | undefined): string {
  if (!next) return "/";
  if (next.startsWith("/") && !next.startsWith("//")) return next; // 같은 사이트 내 경로
  try {
    const u = new URL(next);
    const host = u.hostname;
    const isOurs =
      host === "keywordream.com" || host.endsWith(".keywordream.com");
    const isLocalDev =
      env.SITE_URL.startsWith("http://localhost") &&
      (host === "localhost" || host === "127.0.0.1");
    if ((u.protocol === "https:" && isOurs) || (u.protocol === "http:" && isLocalDev)) {
      return u.toString();
    }
  } catch {
    /* 무시 → "/" */
  }
  return "/";
}

export const authRoutes = new Hono<{ Bindings: Env }>();

authRoutes.get("/providers", (c) =>
  c.json(
    ok({
      providers: enabledProviders(c.env),
      emailLogin: Boolean(c.env.RESEND_API_KEY),
    }),
  ),
);

authRoutes.route("/email", emailAuthRoutes);

authRoutes.get("/:provider/start", (c) => {
  const name = c.req.param("provider");
  if (!isProviderName(name)) return c.json(err("unknown_provider"), 400);
  const provider = getProvider(c.env, name);
  if (!provider) return c.json(err("provider_not_configured"), 400);

  const state = crypto.randomUUID();
  const cookieBase = { httpOnly: true, secure: true, sameSite: "Lax" as const, path: "/", maxAge: 600 };
  setCookie(c, STATE_COOKIE, `${name}:${state}`, cookieBase);
  // keepup 등에서 넘어온 경우 로그인 후 돌아갈 곳 (callback에서 검증 후 사용)
  const next = c.req.query("next");
  if (next) setCookie(c, NEXT_COOKIE, next, cookieBase);

  const redirectUri = `${c.env.SITE_URL}/api/auth/${name}/callback`;
  return c.redirect(provider.authorizeUrl(redirectUri, state));
});

authRoutes.get("/:provider/callback", async (c) => {
  const name = c.req.param("provider");
  if (!isProviderName(name)) return c.json(err("unknown_provider"), 400);
  const provider = getProvider(c.env, name);
  if (!provider) return c.json(err("provider_not_configured"), 400);

  const code = c.req.query("code");
  const state = c.req.query("state");
  const stateCookie = getCookie(c, STATE_COOKIE);
  const next = safeNext(c.env, getCookie(c, NEXT_COOKIE));
  deleteCookie(c, STATE_COOKIE, { path: "/" });
  deleteCookie(c, NEXT_COOKIE, { path: "/" });
  if (!code || !state || stateCookie !== `${name}:${state}`) {
    return c.redirect("/login?error=state");
  }

  try {
    const redirectUri = `${c.env.SITE_URL}/api/auth/${name}/callback`;
    const token = await provider.exchange(code, redirectUri);
    const profile = await provider.profile(token);

    const db = drizzle(c.env.DB);
    const found = await db
      .select()
      .from(users)
      .where(and(eq(users.provider, name), eq(users.providerId, profile.providerId)))
      .limit(1);

    // 대표 시드: ADMIN_EMAIL과 같은 이메일이면 자동 admin
    const isSeedAdmin =
      !!profile.email &&
      profile.email.toLowerCase() === c.env.ADMIN_EMAIL.toLowerCase();

    let userId: number;
    let role: Role;
    if (found.length === 0) {
      role = isSeedAdmin ? "admin" : "member";
      const inserted = await db
        .insert(users)
        .values({
          provider: name,
          providerId: profile.providerId,
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          role,
          createdAt: new Date(),
        })
        .returning({ id: users.id });
      userId = inserted[0].id;
    } else {
      userId = found[0].id;
      role = isSeedAdmin && found[0].role !== "admin" ? "admin" : (found[0].role as Role);
      // 탈퇴했던 계정이 다시 로그인하면 재활성화
      await db
        .update(users)
        .set({
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          email: profile.email,
          role,
          deletedAt: null,
        })
        .where(eq(users.id, userId));
    }

    await createSession(c, {
      userId,
      provider: name,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      role,
    });
    return c.redirect(next);
  } catch (e) {
    console.error("oauth callback error", e);
    return c.redirect("/login?error=oauth");
  }
});

authRoutes.get("/me", async (c) => {
  const sess = await readSession(c);
  if (!sess) return c.json(ok({ user: null }));
  // 역할 변경·탈퇴가 즉시 반영되도록 DB에서 최신 상태를 읽는다
  const db = drizzle(c.env.DB);
  const rows = await db.select().from(users).where(eq(users.id, sess.userId)).limit(1);
  if (rows.length === 0 || rows[0].deletedAt) {
    await destroySession(c);
    return c.json(ok({ user: null }));
  }
  const u = rows[0];
  return c.json(
    ok({
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl,
        role: u.role,
        provider: u.provider,
      },
    }),
  );
});

authRoutes.post("/logout", async (c) => {
  await destroySession(c);
  return c.json(ok({ loggedOut: true }));
});

// KeepUp 앱 전용 — WebView 로그인 완료 후 앱이 이 JSON에서 장기 토큰을 읽어간다
// (앱은 이후 Cookie: session=<token> 헤더로 API 사용)
authRoutes.get("/apptoken", async (c) => {
  const sess = await readSession(c);
  if (!sess) return c.json(err("unauthorized"), 401);
  const token = await createSessionToken(
    c.env,
    sess,
    90 * 24 * 60 * 60, // 앱은 90일 유지
  );
  return c.json(ok({ token }));
});
