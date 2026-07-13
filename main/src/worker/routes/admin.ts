// 관리자 API — 회원 목록 / 역할 변경
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { desc, eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { users } from "../../db/schema";
import type { Env } from "../types";
import { ok, err } from "../types";
import { requireRole, type AuthedUser } from "../middleware";

const PAGE_SIZE = 30;

const roleSchema = z.object({ role: z.enum(["member", "admin"]) });

export const adminRoutes = new Hono<{ Bindings: Env; Variables: { user: AuthedUser } }>();

adminRoutes.use("*", requireRole("admin"));

/** 회원 목록 — ?page=1&q=검색어(이름/이메일) */
adminRoutes.get("/users", async (c) => {
  const page = Math.max(1, Number(c.req.query("page") ?? "1") || 1);
  const q = (c.req.query("q") ?? "").trim();
  const db = drizzle(c.env.DB);

  const where = q
    ? or(like(users.name, `%${q}%`), like(users.email, `%${q}%`))
    : undefined;

  const [rows, totalRow] = await Promise.all([
    db
      .select()
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ count: sql<number>`count(*)` }).from(users).where(where),
  ]);

  return c.json(
    ok({
      users: rows.map((u) => ({
        id: u.id,
        provider: u.provider,
        email: u.email,
        name: u.name,
        avatarUrl: u.avatarUrl,
        role: u.role,
        createdAt: u.createdAt,
        deleted: Boolean(u.deletedAt),
      })),
      total: totalRow[0].count,
      page,
      pageSize: PAGE_SIZE,
    }),
  );
});

/** 역할 변경 (본인 강등 방지) */
adminRoutes.patch("/users/:id/role", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json(err("invalid_id"), 400);
  if (id === c.get("user").id) return c.json(err("cannot_change_self"), 400);
  const parsed = roleSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json(err("invalid_role"), 400);

  const db = drizzle(c.env.DB);
  const found = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (found.length === 0) return c.json(err("not_found"), 404);
  await db.update(users).set({ role: parsed.data.role }).where(eq(users.id, id));
  return c.json(ok({ updated: true }));
});
