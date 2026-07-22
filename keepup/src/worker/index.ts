import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import type { Env } from "./types";
import { ok, err } from "./types";
import { readSession, destroySession } from "./session";
import { postRoutes } from "./routes/posts";
import { mediaRoutes } from "./routes/media";
import { quoteRoutes } from "./routes/quotes";
import { reviewRoutes } from "./routes/reviews";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", (c) => c.json(ok({ service: "keepup-site" })));

// 프론트 공개 설정 — 로그인 진입점(메인 사이트) 주소
app.get("/api/config", (c) => c.json(ok({ mainUrl: c.env.MAIN_URL })));

// 현재 로그인 사용자 — main이 발급한 SSO 세션을 그대로 읽는다
app.get("/api/auth/me", async (c) => {
  const sess = await readSession(c);
  if (!sess) return c.json(ok({ user: null }));
  const db = drizzle(c.env.DB);
  const rows = await db.select().from(users).where(eq(users.id, sess.userId)).limit(1);
  if (rows.length === 0 || rows[0].deletedAt) {
    await destroySession(c);
    return c.json(ok({ user: null }));
  }
  const u = rows[0];
  return c.json(
    ok({
      user: { id: u.id, name: u.name, avatarUrl: u.avatarUrl, role: u.role },
    }),
  );
});

app.post("/api/auth/logout", async (c) => {
  await destroySession(c);
  return c.json(ok({ loggedOut: true }));
});

app.route("/api", postRoutes);
app.route("/api", mediaRoutes);
app.route("/api", quoteRoutes);
app.route("/api", reviewRoutes);

app.notFound((c) => c.json(err("not_found"), 404));

export default app;
