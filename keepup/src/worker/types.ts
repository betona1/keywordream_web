export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  MEDIA: R2Bucket;
  SITE_URL: string;
  /** 로그인 페이지가 있는 메인 사이트 (SSO 진입점) */
  MAIN_URL: string;
  /** 세션 쿠키 공유 도메인 (프로덕션: ".keywordream.com", 로컬: 미설정) */
  COOKIE_DOMAIN?: string;
}

export type Role = "member" | "admin";

export type SessionUser = {
  userId: number;
  provider: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
};

/** API 응답 통일 형식 (main과 동일) */
export const ok = <T>(data: T) => ({ ok: true as const, data });
export const err = (error: string) => ({ ok: false as const, error });
