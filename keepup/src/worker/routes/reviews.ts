// 테스트 의견(피드백) API — Play 비공개 테스트 의견 URL(log.keywordream.com/review)용.
// D1 대신 KV(SESSIONS)에 review: 프리픽스로 저장 (마이그레이션 불필요, 테스트 의견 규모엔 충분).
import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../types";
import { ok, err } from "../types";
import { readSession } from "../session";

const reviewSchema = z.object({
  name: z.string().trim().max(40).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  body: z.string().trim().min(2).max(1000),
});

export const reviewRoutes = new Hono<{ Bindings: Env }>();

// 의견 작성 — 로그인 불필요(테스터 편의). 로그인돼 있으면 이름 자동 사용.
reviewRoutes.post("/reviews", async (c) => {
  const json = await c.req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(json);
  if (!parsed.success) return c.json(err("invalid_input"), 400);
  const { name, rating, body } = parsed.data;
  const sess = await readSession(c);
  const author = (name && name.trim()) || sess?.name || "익명 테스터";
  const createdAt = Date.now();
  const id = `${createdAt}-${crypto.randomUUID().slice(0, 8)}`;
  await c.env.SESSIONS.put(
    `review:${id}`,
    JSON.stringify({ id, author, rating: rating ?? null, body, createdAt }),
    { expirationTtl: 400 * 24 * 60 * 60 },
  );
  return c.json(ok({ id }));
});

// 의견 목록 (최신순)
reviewRoutes.get("/reviews", async (c) => {
  const list = await c.env.SESSIONS.list({ prefix: "review:", limit: 300 });
  const items = await Promise.all(
    list.keys.map(async (k) => {
      const raw = await c.env.SESSIONS.get(k.name);
      return raw ? (JSON.parse(raw) as {
        id: string;
        author: string;
        rating: number | null;
        body: string;
        createdAt: number;
      }) : null;
    }),
  );
  const reviews = items
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
  return c.json(ok({ reviews }));
});
