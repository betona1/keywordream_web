// 게시판 이미지 서빙 (R2 stories/, 누구나 열람 가능)
import { Hono } from "hono";
import type { Env } from "../types";
import { err } from "../types";

export const mediaRoutes = new Hono<{ Bindings: Env }>();

mediaRoutes.get("/media/stories/:postId/:file", async (c) => {
  const postId = c.req.param("postId") ?? "";
  const file = c.req.param("file") ?? "";
  if (!/^\d+$/.test(postId) || !/^[a-z0-9-]+\.(jpg|png|webp)$/.test(file)) {
    return c.json(err("not_found"), 404);
  }
  const obj = await c.env.MEDIA.get(`stories/${postId}/${file}`);
  if (!obj) return c.json(err("not_found"), 404);
  return c.body(obj.body, 200, {
    "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
    "Cache-Control": "public, max-age=604800, immutable",
  });
});
