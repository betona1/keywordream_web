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

/** 현재 앱 버전 — 개선사항 작성 폼의 기본값 */
export const APP_VERSION = "1.2.0";

// ── 베타테스터 ──────────────────────────────────────────────────────
export type BetaStatus = "pending" | "approved" | "rejected";

export type BetaApplication = {
  id: number;
  device: string | null;
  note: string | null;
  status: BetaStatus;
  createdAt: string;
};

export type BetaMe = {
  loggedIn: boolean;
  /** 구글 계정 이메일. 없으면 Play 테스터 등록이 불가해 신청도 막는다 */
  email?: string | null;
  canApply: boolean;
  application: BetaApplication | null;
};

export const BETA_STATUS_LABEL: Record<BetaStatus, string> = {
  pending: "확인 중",
  approved: "참여 승인",
  rejected: "보류",
};

/** 관리자 전용 — 이메일이 포함되므로 공개 화면에서 쓰지 않는다 */
export type BetaTesterRow = {
  id: number;
  name: string;
  email: string;
  device: string | null;
  note: string | null;
  status: BetaStatus;
  createdAt: string;
};

// ── 앱 개선사항 ─────────────────────────────────────────────────────
export type FeedbackKind = "bug" | "idea" | "question";
export type FeedbackStatus = "open" | "planned" | "doing" | "done" | "wontfix";

export type FeedbackItem = {
  id: number;
  kind: FeedbackKind;
  title: string;
  body: string;
  appVersion: string | null;
  device: string | null;
  status: FeedbackStatus;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
  author: Author;
  mine: boolean;
};

export type FeedbackListResponse = {
  items: FeedbackItem[];
  total: number;
  page: number;
  pageSize: number;
  stats: { total: number; done: number; replied: number };
  canModerate: boolean;
};

export const FEEDBACK_KIND_LABEL: Record<FeedbackKind, string> = {
  bug: "버그",
  idea: "제안",
  question: "질문",
};

export const FEEDBACK_STATUS_LABEL: Record<FeedbackStatus, string> = {
  open: "접수",
  planned: "반영 예정",
  doing: "작업 중",
  done: "반영 완료",
  wontfix: "보류",
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
