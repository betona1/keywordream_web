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
