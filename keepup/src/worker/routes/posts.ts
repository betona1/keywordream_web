// 성과 인증 게시판 API — 목록/상세/작성(사진 업로드)/삭제/댓글/응원(도장)
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { posts, postImages, postComments, postCheers, users } from "../../db/schema";
import type { Env } from "../types";
import { ok, err } from "../types";
import { requireLogin, type AuthedUser } from "../middleware";
import { readSession } from "../session";

const PAGE_SIZE = 12;
const MAX_IMAGES = 6;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const postSchema = z.object({
  title: z.string().trim().min(1).max(80),
  routineType: z.enum(["stack", "goal"]),
  routineName: z.string().trim().min(1).max(60),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  certCount: z.coerce.number().int().min(0).max(10000).optional(),
  achievedPercent: z.coerce.number().int().min(0).max(1000).optional(),
  body: z.string().trim().min(1).max(5000),
});

const commentSchema = z.object({ body: z.string().trim().min(1).max(1000) });

export const postRoutes = new Hono<{ Bindings: Env; Variables: { user: AuthedUser } }>();

/** 목록 — 열람은 누구나 */
postRoutes.get("/posts", async (c) => {
  const page = Math.max(1, Number(c.req.query("page") ?? "1") || 1);
  const db = drizzle(c.env.DB);
  const notDeleted = isNull(posts.deletedAt);

  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: posts.id,
        title: posts.title,
        routineType: posts.routineType,
        routineName: posts.routineName,
        periodStart: posts.periodStart,
        periodEnd: posts.periodEnd,
        certCount: posts.certCount,
        achievedPercent: posts.achievedPercent,
        createdAt: posts.createdAt,
        authorId: users.id,
        authorName: users.name,
        authorAvatar: users.avatarUrl,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(notDeleted)
      .orderBy(desc(posts.id))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ count: sql<number>`count(*)` }).from(posts).where(notDeleted),
  ]);

  const ids = rows.map((r) => r.id);
  const [covers, cheerCounts, commentCounts] =
    ids.length === 0
      ? [[], [], []]
      : await Promise.all([
          db
            .select({
              postId: postImages.postId,
              fileKey: sql<string>`min(${postImages.sort} || ':' || ${postImages.fileKey})`,
            })
            .from(postImages)
            .where(inArray(postImages.postId, ids))
            .groupBy(postImages.postId),
          db
            .select({ postId: postCheers.postId, count: sql<number>`count(*)` })
            .from(postCheers)
            .where(inArray(postCheers.postId, ids))
            .groupBy(postCheers.postId),
          db
            .select({ postId: postComments.postId, count: sql<number>`count(*)` })
            .from(postComments)
            .where(and(inArray(postComments.postId, ids), isNull(postComments.deletedAt)))
            .groupBy(postComments.postId),
        ]);

  const coverMap = new Map(covers.map((r) => [r.postId, r.fileKey.split(":").slice(1).join(":")]));
  const cheerMap = new Map(cheerCounts.map((r) => [r.postId, r.count]));
  const commentMap = new Map(commentCounts.map((r) => [r.postId, r.count]));

  // 히어로에 띄우는 게시판 전체 집계 — 현재 페이지가 아니라 삭제되지 않은 전체 기준
  const [certRow, totalCheerRow] = await Promise.all([
    db
      .select({ sum: sql<number>`coalesce(sum(${posts.certCount}), 0)` })
      .from(posts)
      .where(notDeleted),
    db
      .select({ count: sql<number>`count(*)` })
      .from(postCheers)
      .innerJoin(posts, eq(postCheers.postId, posts.id))
      .where(notDeleted),
  ]);

  return c.json(
    ok({
      posts: rows.map((r) => ({
        id: r.id,
        title: r.title,
        routineType: r.routineType,
        routineName: r.routineName,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        certCount: r.certCount,
        achievedPercent: r.achievedPercent,
        createdAt: r.createdAt,
        author: { id: r.authorId, name: r.authorName, avatarUrl: r.authorAvatar },
        coverKey: coverMap.get(r.id) ?? null,
        cheerCount: cheerMap.get(r.id) ?? 0,
        commentCount: commentMap.get(r.id) ?? 0,
      })),
      total: totalRow[0].count,
      page,
      pageSize: PAGE_SIZE,
      stats: {
        posts: totalRow[0].count,
        certs: certRow[0].sum,
        cheers: totalCheerRow[0].count,
      },
    }),
  );
});

/** 상세 — 열람은 누구나, 내 응원 여부는 로그인 시에만 */
postRoutes.get("/posts/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json(err("invalid_id"), 400);
  const db = drizzle(c.env.DB);

  const rows = await db
    .select({
      post: posts,
      authorId: users.id,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
    .limit(1);
  if (rows.length === 0) return c.json(err("not_found"), 404);
  const { post, authorId, authorName, authorAvatar } = rows[0];

  const sess = await readSession(c);
  const [images, comments, cheerRow, myCheer] = await Promise.all([
    db.select().from(postImages).where(eq(postImages.postId, id)).orderBy(postImages.sort),
    db
      .select({
        id: postComments.id,
        body: postComments.body,
        createdAt: postComments.createdAt,
        authorId: users.id,
        authorName: users.name,
        authorAvatar: users.avatarUrl,
      })
      .from(postComments)
      .innerJoin(users, eq(postComments.userId, users.id))
      .where(and(eq(postComments.postId, id), isNull(postComments.deletedAt)))
      .orderBy(postComments.id),
    db.select({ count: sql<number>`count(*)` }).from(postCheers).where(eq(postCheers.postId, id)),
    sess
      ? db
          .select({ id: postCheers.id })
          .from(postCheers)
          .where(and(eq(postCheers.postId, id), eq(postCheers.userId, sess.userId)))
          .limit(1)
      : Promise.resolve([]),
  ]);

  return c.json(
    ok({
      post: {
        id: post.id,
        title: post.title,
        routineType: post.routineType,
        routineName: post.routineName,
        periodStart: post.periodStart,
        periodEnd: post.periodEnd,
        certCount: post.certCount,
        achievedPercent: post.achievedPercent,
        body: post.body,
        createdAt: post.createdAt,
        author: { id: authorId, name: authorName, avatarUrl: authorAvatar },
        images: images.map((i) => i.fileKey),
        cheerCount: cheerRow[0].count,
        myCheer: myCheer.length > 0,
        mine: sess ? sess.userId === authorId : false,
        canModerate: sess ? sess.userId === authorId || sess.role === "admin" : false,
      },
      comments: comments.map((cm) => ({
        id: cm.id,
        body: cm.body,
        createdAt: cm.createdAt,
        author: { id: cm.authorId, name: cm.authorName, avatarUrl: cm.authorAvatar },
        mine: sess ? sess.userId === cm.authorId : false,
      })),
    }),
  );
});

/** 작성 — 로그인 필수, multipart(글 필드 + images 파일 최대 6장) */
postRoutes.post("/posts", requireLogin(), async (c) => {
  const fd = await c.req.formData().catch(() => null);
  if (!fd) return c.json(err("invalid_form"), 400);

  const parsed = postSchema.safeParse(Object.fromEntries(
    ["title", "routineType", "routineName", "periodStart", "periodEnd", "certCount", "achievedPercent", "body"]
      .map((k) => [k, fd.get(k) ?? undefined])
      .filter(([, v]) => v !== undefined && v !== ""),
  ));
  if (!parsed.success) return c.json(err("invalid_input"), 400);

  const files = fd.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_IMAGES) return c.json(err("too_many_images"), 400);
  for (const f of files) {
    if (!IMAGE_EXT[f.type]) return c.json(err("unsupported_image_type"), 400);
    if (f.size > MAX_IMAGE_BYTES) return c.json(err("image_too_large"), 400);
  }

  const db = drizzle(c.env.DB);
  const inserted = await db
    .insert(posts)
    .values({
      userId: c.get("user").id,
      routineType: parsed.data.routineType,
      title: parsed.data.title,
      routineName: parsed.data.routineName,
      periodStart: parsed.data.periodStart || null,
      periodEnd: parsed.data.periodEnd || null,
      certCount: parsed.data.certCount ?? null,
      achievedPercent: parsed.data.achievedPercent ?? null,
      body: parsed.data.body,
      createdAt: new Date(),
    })
    .returning({ id: posts.id });
  const postId = inserted[0].id;

  // 이미지 업로드가 중간에 실패하면 글까지 되돌린다 — 이미지 없는 글이 남아
  // 재시도 시 중복 게시되는 것을 막는다
  const uploadedKeys: string[] = [];
  try {
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const key = `stories/${postId}/${crypto.randomUUID()}.${IMAGE_EXT[f.type]}`;
      await c.env.MEDIA.put(key, f.stream(), {
        httpMetadata: { contentType: f.type },
      });
      uploadedKeys.push(key);
      await db.insert(postImages).values({ postId, fileKey: key, sort: i });
    }
  } catch {
    await Promise.allSettled([
      ...uploadedKeys.map((key) => c.env.MEDIA.delete(key)),
      db.delete(postImages).where(eq(postImages.postId, postId)),
    ]);
    await db.delete(posts).where(eq(posts.id, postId));
    return c.json(err("image_upload_failed"), 500);
  }

  return c.json(ok({ id: postId }));
});

/** 삭제 — 작성자 또는 admin (소프트 삭제) */
postRoutes.delete("/posts/:id", requireLogin(), async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json(err("invalid_id"), 400);
  const db = drizzle(c.env.DB);
  const found = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (found.length === 0 || found[0].deletedAt) return c.json(err("not_found"), 404);
  const u = c.get("user");
  if (found[0].userId !== u.id && u.role !== "admin") return c.json(err("forbidden"), 403);
  await db.update(posts).set({ deletedAt: new Date() }).where(eq(posts.id, id));
  return c.json(ok({ deleted: true }));
});

/** 댓글 작성 */
postRoutes.post("/posts/:id/comments", requireLogin(), async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json(err("invalid_id"), 400);
  const parsed = commentSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json(err("invalid_input"), 400);
  const db = drizzle(c.env.DB);
  const found = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
    .limit(1);
  if (found.length === 0) return c.json(err("not_found"), 404);
  const inserted = await db
    .insert(postComments)
    .values({ postId: id, userId: c.get("user").id, body: parsed.data.body, createdAt: new Date() })
    .returning({ id: postComments.id });
  return c.json(ok({ id: inserted[0].id }));
});

/** 댓글 삭제 — 작성자 또는 admin */
postRoutes.delete("/comments/:id", requireLogin(), async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json(err("invalid_id"), 400);
  const db = drizzle(c.env.DB);
  const found = await db.select().from(postComments).where(eq(postComments.id, id)).limit(1);
  if (found.length === 0 || found[0].deletedAt) return c.json(err("not_found"), 404);
  const u = c.get("user");
  if (found[0].userId !== u.id && u.role !== "admin") return c.json(err("forbidden"), 403);
  await db.update(postComments).set({ deletedAt: new Date() }).where(eq(postComments.id, id));
  return c.json(ok({ deleted: true }));
});

/** 응원(도장) 토글 — 1인 1스탬프 */
postRoutes.post("/posts/:id/cheer", requireLogin(), async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json(err("invalid_id"), 400);
  const db = drizzle(c.env.DB);
  const found = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
    .limit(1);
  if (found.length === 0) return c.json(err("not_found"), 404);

  const uid = c.get("user").id;
  const existing = await db
    .select({ id: postCheers.id })
    .from(postCheers)
    .where(and(eq(postCheers.postId, id), eq(postCheers.userId, uid)))
    .limit(1);

  let cheered: boolean;
  if (existing.length > 0) {
    await db.delete(postCheers).where(eq(postCheers.id, existing[0].id));
    cheered = false;
  } else {
    await db.insert(postCheers).values({ postId: id, userId: uid, createdAt: new Date() });
    cheered = true;
  }
  const countRow = await db
    .select({ count: sql<number>`count(*)` })
    .from(postCheers)
    .where(eq(postCheers.postId, id));
  return c.json(ok({ cheered, count: countRow[0].count }));
});
