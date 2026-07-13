// 마이페이지 API — 이름 변경 / 회원 탈퇴(소프트 삭제)
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { users } from "../../db/schema";
import type { Env } from "../types";
import { ok, err } from "../types";
import { requireRole, type AuthedUser } from "../middleware";
import { destroySession } from "../auth/session";

const nameSchema = z.object({ name: z.string().trim().min(1).max(30) });

export const meRoutes = new Hono<{ Bindings: Env; Variables: { user: AuthedUser } }>();

/** 표시 이름 변경 */
meRoutes.patch("/", requireRole("member"), async (c) => {
  const parsed = nameSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json(err("invalid_name"), 400);
  const db = drizzle(c.env.DB);
  await db
    .update(users)
    .set({ name: parsed.data.name })
    .where(eq(users.id, c.get("user").id));
  return c.json(ok({ updated: true }));
});

/** 회원 탈퇴 — 개인정보 비우고 소프트 삭제 (게시글/댓글 FK 보존, 작성자는 '탈퇴한 회원'으로 표시) */
meRoutes.delete("/", requireRole("member"), async (c) => {
  const db = drizzle(c.env.DB);
  await db
    .update(users)
    .set({
      name: "탈퇴한 회원",
      email: null,
      avatarUrl: null,
      role: "member",
      deletedAt: new Date(),
    })
    .where(eq(users.id, c.get("user").id));
  await destroySession(c);
  return c.json(ok({ deleted: true }));
});
