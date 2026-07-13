// 습관 명언 공개 API — KeepUp 앱이 받아서 내장 명언과 병합해 '오늘의 명언'으로 표시
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { desc } from "drizzle-orm";
import { quotes } from "../../db/schema";
import type { Env } from "../types";
import { ok } from "../types";

export const quoteRoutes = new Hono<{ Bindings: Env }>();

quoteRoutes.get("/quotes", async (c) => {
  const db = drizzle(c.env.DB);
  const rows = await db
    .select({ text: quotes.text, author: quotes.author })
    .from(quotes)
    .orderBy(desc(quotes.id));
  c.header("Cache-Control", "public, max-age=3600"); // 앱/엣지 캐시 1시간
  return c.json(ok({ quotes: rows }));
});
