export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  SITE_URL: string;
  /** 세션 쿠키 공유 도메인 (프로덕션: ".keywordream.com", 로컬: 미설정) */
  COOKIE_DOMAIN?: string;
  /** 이 이메일 계정은 로그인 시 자동으로 admin */
  ADMIN_EMAIL: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  KAKAO_CLIENT_ID?: string;
  KAKAO_CLIENT_SECRET?: string;
  NAVER_CLIENT_ID?: string;
  NAVER_CLIENT_SECRET?: string;
  RESEND_API_KEY?: string;
  /** 이메일 로그인 발신 주소 — Resend 인증 도메인이어야 함 */
  EMAIL_FROM?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export type Role = "member" | "admin";

export const ROLE_LEVEL: Record<Role, number> = {
  member: 0,
  admin: 1,
};

export type SessionUser = {
  userId: number;
  provider: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
};

/** API 응답 통일 형식 */
export const ok = <T>(data: T) => ({ ok: true as const, data });
export const err = (error: string) => ({ ok: false as const, error });
