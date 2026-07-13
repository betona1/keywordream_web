// 관리자 명언 관리 API — KeepUp 앱의 '오늘의 명언'에 추가 공급
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { quotes } from "../../db/schema";
import type { Env } from "../types";
import { ok, err } from "../types";
import { requireRole, type AuthedUser } from "../middleware";

const quoteSchema = z.object({
  text: z.string().trim().min(2).max(300),
  author: z.string().trim().min(1).max(60),
});

export const quoteAdminRoutes = new Hono<{
  Bindings: Env;
  Variables: { user: AuthedUser };
}>();

quoteAdminRoutes.use("*", requireRole("admin"));

quoteAdminRoutes.get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const rows = await db.select().from(quotes).orderBy(desc(quotes.id));
  return c.json(ok({ quotes: rows }));
});

quoteAdminRoutes.post("/", async (c) => {
  const parsed = quoteSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json(err("invalid_input"), 400);
  const db = drizzle(c.env.DB);
  const inserted = await db
    .insert(quotes)
    .values({ ...parsed.data, createdAt: new Date() })
    .returning({ id: quotes.id });
  return c.json(ok({ id: inserted[0].id }));
});

quoteAdminRoutes.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json(err("invalid_id"), 400);
  const db = drizzle(c.env.DB);
  await db.delete(quotes).where(eq(quotes.id, id));
  return c.json(ok({ deleted: true }));
});
