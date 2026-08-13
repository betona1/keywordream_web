// 클라우드 백업(동기화) API — 앱/웹앱의 전체 기록을 계정에 보관한다.
//
// 앱이 이미 만들고 있는 백업 ZIP(data.json + media/*)을 그대로 한 덩어리로 저장한다.
// 덕분에 서버는 내용을 해석할 필요가 없고, 앱은 기존 내보내기·불러오기 로직을 재사용한다.
// 사용자당 최신 1개만 유지(마지막 저장이 이김) — 여러 기기에서 동시에 쓰는 경우는
// '올리기/내리기'를 사용자가 직접 누르는 수동 방식이라 충돌이 드물다.
//
// ⚠️ 이 파일은 개인 기록을 다룬다. 키에 userId를 박아 남의 백업에 접근할 수 없게 하고,
//    공개 미디어 서빙(routes/media.ts)은 stories/ 프리픽스만 허용하므로 sync/는 노출되지 않는다.
import { Hono } from "hono";
import type { Env } from "../types";
import { ok, err } from "../types";
import { requireLogin, type AuthedUser } from "../middleware";

/** Workers 요청 본문 한계와 사용자 대기시간을 고려한 상한 */
const MAX_BYTES = 60 * 1024 * 1024; // 60MB

const keyFor = (userId: number) => `sync/${userId}/backup.zip`;

/** '가져오기 요청'의 수명 — 상대 기기가 이 시간 안에 앱을 열지 않으면 자동 소멸 */
const REQUEST_TTL_SECONDS = 15 * 60;
const requestKeyFor = (userId: number) => `syncreq:${userId}`;

export const syncRoutes = new Hono<{ Bindings: Env; Variables: { user: AuthedUser } }>();

/** 내 백업 정보 — 언제 올렸고 얼마나 큰지 */
syncRoutes.get("/sync/meta", requireLogin(), async (c) => {
  const obj = await c.env.MEDIA.head(keyFor(c.get("user").id));
  return c.json(
    ok(
      obj
        ? { exists: true, size: obj.size, updatedAt: obj.uploaded.toISOString() }
        : { exists: false, size: 0, updatedAt: null },
    ),
  );
});

/** 올리기 — 본문은 백업 ZIP 바이너리 그대로 */
syncRoutes.put("/sync", requireLogin(), async (c) => {
  const len = Number(c.req.header("content-length") ?? "0");
  if (len > MAX_BYTES) return c.json(err("too_large"), 413);

  const body = await c.req.arrayBuffer();
  if (body.byteLength === 0) return c.json(err("empty_body"), 400);
  if (body.byteLength > MAX_BYTES) return c.json(err("too_large"), 413);

  // ZIP 시그니처 확인 — 엉뚱한 본문이 올라와 복원 때 깨지는 것을 막는다
  const head = new Uint8Array(body.slice(0, 2));
  if (head[0] !== 0x50 || head[1] !== 0x4b) return c.json(err("not_a_zip"), 400);

  const key = keyFor(c.get("user").id);
  await c.env.MEDIA.put(key, body, {
    httpMetadata: { contentType: "application/zip" },
  });
  const obj = await c.env.MEDIA.head(key);
  return c.json(
    ok({ size: obj?.size ?? body.byteLength, updatedAt: (obj?.uploaded ?? new Date()).toISOString() }),
  );
});

/** 내리기 — 저장해 둔 ZIP을 그대로 돌려준다 */
syncRoutes.get("/sync", requireLogin(), async (c) => {
  const obj = await c.env.MEDIA.get(keyFor(c.get("user").id));
  if (!obj) return c.json(err("not_found"), 404);
  return c.body(obj.body, 200, {
    "Content-Type": "application/zip",
    // 개인 기록이므로 중간 캐시에 남지 않게 한다
    "Cache-Control": "private, no-store",
  });
});

/** 삭제 — 클라우드에 둔 기록만 지운다 (기기 안 기록은 그대로) */
syncRoutes.delete("/sync", requireLogin(), async (c) => {
  await c.env.MEDIA.delete(keyFor(c.get("user").id));
  return c.json(ok({ deleted: true }));
});

// ── 기기 간 '가져오기 요청' ─────────────────────────────────────────
// 웹(또는 다른 기기)에서 요청을 남겨 두면, 기록이 있는 기기의 앱이 열릴 때
// 승인 안내를 띄우고 [보내기]로 업로드한다. 푸시 서버 없이 폴링으로 동작.
// 같은 계정 안에서만 오가는 신호라 개인정보는 clientId(무작위 기기 식별자)뿐이다.

/** 요청 남기기 — {clientId}: 요청을 보낸 기기 (자기 자신에게 승인 창이 뜨지 않게) */
syncRoutes.post("/sync/request", requireLogin(), async (c) => {
  const body = (await c.req.json().catch(() => null)) as { clientId?: string } | null;
  const clientId = typeof body?.clientId === "string" ? body.clientId.slice(0, 64) : "";
  if (!clientId) return c.json(err("invalid_input"), 400);
  const requestedAt = new Date().toISOString();
  await c.env.SESSIONS.put(
    requestKeyFor(c.get("user").id),
    JSON.stringify({ clientId, requestedAt }),
    { expirationTtl: REQUEST_TTL_SECONDS },
  );
  return c.json(ok({ requestedAt, ttlSeconds: REQUEST_TTL_SECONDS }));
});

/** 대기 중인 요청 확인 — 앱이 열릴 때 폴링한다 */
syncRoutes.get("/sync/request", requireLogin(), async (c) => {
  const raw = await c.env.SESSIONS.get(requestKeyFor(c.get("user").id));
  if (!raw) return c.json(ok({ pending: false }));
  try {
    const req = JSON.parse(raw) as { clientId: string; requestedAt: string };
    return c.json(ok({ pending: true, ...req }));
  } catch {
    return c.json(ok({ pending: false }));
  }
});

/** 요청 지우기 — 보낸 쪽 취소, 받은 쪽 거절, 업로드 완료 후 정리 */
syncRoutes.delete("/sync/request", requireLogin(), async (c) => {
  await c.env.SESSIONS.delete(requestKeyFor(c.get("user").id));
  return c.json(ok({ deleted: true }));
});
