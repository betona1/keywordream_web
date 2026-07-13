// OAuth 소셜 로그인 3종 — Google / 카카오 / 네이버 (exansys.net 검증 코드 포팅)
import type { Env } from "../types";

export type ProviderName = "google" | "kakao" | "naver";

export type OAuthProfile = {
  providerId: string;
  name: string;
  avatarUrl: string | null;
  /** 제공자가 이메일을 주는 경우만 — ADMIN_EMAIL 시드 판별·연락용 */
  email: string | null;
};

type ProviderConfig = {
  clientId: string;
  clientSecret?: string;
  authorizeUrl: (redirectUri: string, state: string) => string;
  exchange: (code: string, redirectUri: string) => Promise<string>; // access_token 반환
  profile: (accessToken: string) => Promise<OAuthProfile>;
};

export function enabledProviders(env: Env): ProviderName[] {
  const list: ProviderName[] = [];
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) list.push("google");
  if (env.KAKAO_CLIENT_ID) list.push("kakao");
  if (env.NAVER_CLIENT_ID && env.NAVER_CLIENT_SECRET) list.push("naver");
  return list;
}

async function postForm(url: string, body: Record<string, string>): Promise<any> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams(body).toString(),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status}`);
  return res.json();
}

export function getProvider(env: Env, name: ProviderName): ProviderConfig | null {
  if (!enabledProviders(env).includes(name)) return null;

  if (name === "google") {
    return {
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      authorizeUrl: (redirectUri, state) =>
        `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
          client_id: env.GOOGLE_CLIENT_ID!,
          redirect_uri: redirectUri,
          response_type: "code",
          scope: "openid email profile",
          state,
        })}`,
      exchange: async (code, redirectUri) => {
        const json = await postForm("https://oauth2.googleapis.com/token", {
          client_id: env.GOOGLE_CLIENT_ID!,
          client_secret: env.GOOGLE_CLIENT_SECRET!,
          code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        });
        if (!json.access_token) throw new Error("no access_token");
        return json.access_token;
      },
      profile: async (token) => {
        const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`google profile failed: ${res.status}`);
        const u: any = await res.json();
        return {
          providerId: String(u.sub),
          name: u.name || "Google 사용자",
          avatarUrl: u.picture ?? null,
          email: u.email ?? null,
        };
      },
    };
  }

  if (name === "naver") {
    return {
      clientId: env.NAVER_CLIENT_ID!,
      clientSecret: env.NAVER_CLIENT_SECRET!,
      authorizeUrl: (redirectUri, state) =>
        `https://nid.naver.com/oauth2.0/authorize?${new URLSearchParams({
          response_type: "code",
          client_id: env.NAVER_CLIENT_ID!,
          redirect_uri: redirectUri,
          state,
        })}`,
      exchange: async (code, redirectUri) => {
        const json = await postForm("https://nid.naver.com/oauth2.0/token", {
          grant_type: "authorization_code",
          client_id: env.NAVER_CLIENT_ID!,
          client_secret: env.NAVER_CLIENT_SECRET!,
          code,
          redirect_uri: redirectUri,
        });
        if (!json.access_token) throw new Error("no access_token");
        return json.access_token;
      },
      profile: async (token) => {
        const res = await fetch("https://openapi.naver.com/v1/nid/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`naver profile failed: ${res.status}`);
        const u: any = await res.json();
        const p = u.response ?? {};
        if (!p.id) throw new Error("no naver id");
        return {
          providerId: String(p.id),
          name: p.nickname || p.name || "네이버 사용자",
          avatarUrl: p.profile_image ?? null,
          email: p.email ?? null,
        };
      },
    };
  }

  // kakao — client_secret은 카카오 설정에서 활성화한 경우에만 필요
  return {
    clientId: env.KAKAO_CLIENT_ID!,
    clientSecret: env.KAKAO_CLIENT_SECRET,
    authorizeUrl: (redirectUri, state) =>
      `https://kauth.kakao.com/oauth/authorize?${new URLSearchParams({
        client_id: env.KAKAO_CLIENT_ID!,
        redirect_uri: redirectUri,
        response_type: "code",
        state,
      })}`,
    exchange: async (code, redirectUri) => {
      const body: Record<string, string> = {
        grant_type: "authorization_code",
        client_id: env.KAKAO_CLIENT_ID!,
        redirect_uri: redirectUri,
        code,
      };
      if (env.KAKAO_CLIENT_SECRET) body.client_secret = env.KAKAO_CLIENT_SECRET;
      const json = await postForm("https://kauth.kakao.com/oauth/token", body);
      if (!json.access_token) throw new Error("no access_token");
      return json.access_token;
    },
    profile: async (token) => {
      const res = await fetch("https://kapi.kakao.com/v2/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`kakao profile failed: ${res.status}`);
      const u: any = await res.json();
      const p = u.kakao_account?.profile ?? {};
      return {
        providerId: String(u.id),
        name: p.nickname || "카카오 사용자",
        avatarUrl: p.profile_image_url ?? null,
        email: u.kakao_account?.email ?? null,
      };
    },
  };
}
