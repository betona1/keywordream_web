export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function api<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const isJson = typeof init?.body === "string";
    const res = await fetch(path, {
      credentials: "same-origin",
      headers: isJson ? { "Content-Type": "application/json" } : undefined,
      ...init,
    });
    return (await res.json()) as ApiResult<T>;
  } catch {
    return { ok: false, error: "network_error" };
  }
}

export type Me = {
  id: number;
  name: string;
  avatarUrl: string | null;
  role: "member" | "admin";
} | null;

export type Author = { id: number; name: string; avatarUrl: string | null };

export type PostCard = {
  id: number;
  title: string;
  routineType: "stack" | "goal";
  routineName: string;
  periodStart: string | null;
  periodEnd: string | null;
  certCount: number | null;
  achievedPercent: number | null;
  createdAt: string;
  author: Author;
  coverKey: string | null;
  cheerCount: number;
  commentCount: number;
};

/** 게시판 전체 집계 — 히어로 숫자 스트립용 */
export type BoardStats = { posts: number; certs: number; cheers: number };

export type PostListResponse = {
  posts: PostCard[];
  total: number;
  page: number;
  pageSize: number;
  stats: BoardStats;
};

export type PostDetail = Omit<PostCard, "coverKey" | "commentCount"> & {
  body: string;
  images: string[];
  myCheer: boolean;
  mine: boolean;
  canModerate: boolean;
};

export type Comment = {
  id: number;
  body: string;
  createdAt: string;
  author: Author;
  mine: boolean;
};

export const ROUTINE_TYPE_LABEL: Record<"stack" | "goal", string> = {
  stack: "적립형",
  goal: "결과형",
};

/** Google Play 정식 출시 주소 — 설치 QR(public/qr-play.svg)도 이 URL로 만들어져 있다 */
export const PLAY_URL = "https://play.google.com/store/apps/details?id=com.keywordream.keepup";

/** 메인 사이트 로그인으로 이동 (로그인 후 현재 페이지 복귀) */
export function loginUrl(mainUrl: string, next?: string): string {
  const target = next ?? window.location.href;
  return `${mainUrl}/login?next=${encodeURIComponent(target)}`;
}

export function mediaUrl(fileKey: string): string {
  return `/api/media/${fileKey}`;
}

export function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}
