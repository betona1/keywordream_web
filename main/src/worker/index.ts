import { Hono } from "hono";
import type { Env } from "./types";
import { ok, err } from "./types";
import { authRoutes } from "./auth/routes";
import { meRoutes } from "./routes/me";
import { adminRoutes } from "./routes/admin";
import { quoteAdminRoutes } from "./routes/quotes";

const app = new Hono<{ Bindings: Env }>();

// www → apex 리다이렉트
app.use("*", async (c, next) => {
  const url = new URL(c.req.url);
  if (url.hostname === "www.keywordream.com") {
    url.hostname = "keywordream.com";
    return c.redirect(url.toString(), 301);
  }
  await next();
});

app.get("/api/health", (c) => c.json(ok({ service: "keywordream-main" })));

// 프론트에서 필요한 공개 설정 값
app.get("/api/config", (c) =>
  c.json(ok({ turnstileSiteKey: c.env.TURNSTILE_SITE_KEY || null })),
);

app.route("/api/auth", authRoutes);
app.route("/api/me", meRoutes);
app.route("/api/admin/quotes", quoteAdminRoutes);
app.route("/api/admin", adminRoutes);

app.notFound((c) => c.json(err("not_found"), 404));

export default app;
