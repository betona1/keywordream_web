import type { Context, Next } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import type { Env, Role } from "./types";
import { err } from "./types";
import { readSession } from "./session";

export type AuthedUser = {
  id: number;
  name: string;
  role: Role;
};

/** 로그인(member 이상) 필수 — DB 최신 역할 기준, 탈퇴 계정 차단 */
export function requireLogin() {
  return async (
    c: Context<{ Bindings: Env; Variables: { user: AuthedUser } }>,
    next: Next,
  ) => {
    const sess = await readSession(c);
    if (!sess) return c.json(err("unauthorized"), 401);
    const db = drizzle(c.env.DB);
    const rows = await db.select().from(users).where(eq(users.id, sess.userId)).limit(1);
    if (rows.length === 0 || rows[0].deletedAt) return c.json(err("unauthorized"), 401);
    c.set("user", { id: rows[0].id, name: rows[0].name, role: rows[0].role as Role });
    await next();
  };
}
