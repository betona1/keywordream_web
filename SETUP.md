# keywordream 웹 — Cloudflare 셋업 가이드

> 현재 상태: 도메인 keywordream.com **구입만 완료**. 아래 순서대로 진행하면 두 사이트가 올라간다.
> 모든 명령은 PowerShell/터미널에서 실행. `wrangler`는 각 프로젝트에 devDependency로 설치되어 있어 `npx wrangler ...`로 실행한다.

---

## 0. 준비물

```bash
# Cloudflare 계정 로그인 (브라우저 열림)
cd main
npx wrangler login
```

## 1. 도메인을 Cloudflare에 연결

1. https://dash.cloudflare.com → **Add a site** → `keywordream.com` 입력 → **Free 플랜** 선택.
2. Cloudflare가 알려주는 **네임서버 2개**를 도메인 구입처(가비아 등)의 네임서버 설정에 입력.
3. 전파까지 몇 분~몇 시간. 대시보드에서 상태가 **Active**가 되면 완료.
   - DNS 레코드는 따로 만들 필요 없음 — Workers 커스텀 도메인 배포가 자동 생성한다.

## 2. 리소스 생성 (D1 / KV / R2)

```bash
cd main

# ① D1 (회원 + 게시판 DB)
npx wrangler d1 create keywordream-db
#   → 출력된 database_id 를 복사해서 두 파일에 붙여넣기:
#     main/wrangler.jsonc   의 "database_id"
#     keepup/wrangler.jsonc 의 "database_id"  (같은 값!)

# ② KV (세션 저장소)
npx wrangler kv namespace create SESSIONS
#   → 출력된 id 를 두 파일에 붙여넣기:
#     main/wrangler.jsonc   kv_namespaces[0].id
#     keepup/wrangler.jsonc kv_namespaces[0].id  (같은 값!)

# ③ R2 (게시판 인증 사진) — ⚠️ 결제수단(카드) 등록 필요, 10GB까지는 무료
#   대시보드 R2 메뉴에서 카드 등록 후:
npx wrangler r2 bucket create keepup-media

# ④ DB 테이블 생성 (원격)
npx wrangler d1 migrations apply keywordream-db --remote
```

> D1/KV는 **두 워커가 같은 리소스를 바인딩**한다 — 이게 SSO(메인에서 로그인 → keepup에서 인식)의 핵심.
> 스키마 변경 시: `main/src/db/schema.ts` 수정 → `keepup/src/db/schema.ts`에 복사 →
> `cd main && npm run db:generate && npx wrangler d1 migrations apply keywordream-db --remote`

## 3. 소셜 로그인(OAuth) 앱 등록

콜백 주소는 전부 **keywordream.com(메인)** 기준이다. keepup에는 등록할 것 없음.

| 제공자 | 콘솔 | Redirect URI | 상태 |
|---|---|---|---|
| 카카오 | developers.kakao.com — KeepUp 앱(ID 1512287) | `https://keywordream.com/api/auth/kakao/callback` | ✅ 완료 (2026-07-13) |
| 구글 | console.cloud.google.com — keywordream 프로젝트, keywordream-web 클라이언트, 프로덕션 게시 | `https://keywordream.com/api/auth/google/callback` | ✅ 완료 (2026-07-13) |
| 네이버 | developers.naver.com — keywordream 앱 | `https://keywordream.com/api/auth/naver/callback` | ✅ 완료 (2026-07-13) |

**⚠️ 키 관리 원칙: 어떤 키도 코드/wrangler.jsonc에 하드코딩하지 않는다.**
- 프로덕션: `wrangler secret put <이름>` (Client ID 포함 전부 시크릿으로)
- 로컬 개발: `main/.dev.vars` (.env 역할, git 제외) — 현재 카카오/구글 값 입력됨
- 주의: 같은 이름의 var가 이미 배포에 있으면 secret 등록이 실패한다. var 제거 → 배포 → secret 순서.

```bash
cd main
npx wrangler secret put NAVER_CLIENT_ID
npx wrangler secret put NAVER_CLIENT_SECRET
```

- 카카오 동의항목에서 닉네임/프로필 이미지(+가능하면 이메일), 네이버에서 닉네임/프로필/이메일을 설정.

## 4. 이메일 로그인(선택이지만 권장) + Turnstile(선택)

**Resend** (이메일 인증코드 발송): ✅ 완료 (2026-07-13)
- 기존 exansys 계정 공용 — 발신 주소는 `EMAIL_FROM` var(`keywordream <login@exansys.net>`)로 관리.
  (Resend 무료 플랜은 도메인 1개라 keywordream.com 미등록. 자체 도메인 발송으로 바꾸려면 Pro 또는 별도 계정 후 EMAIL_FROM만 교체.)
- API 키 `keywordream-login`(Sending 전용) → `RESEND_API_KEY` 시크릿 + .dev.vars.
- 미설정 시 이메일 로그인 버튼이 자동으로 숨겨진다(소셜만 노출).

**Turnstile** (이메일 폼 스팸 방지):
1. Cloudflare 대시보드 → Turnstile → 사이트 추가(keywordream.com).
2. Site Key → `main/wrangler.jsonc` vars의 `TURNSTILE_SITE_KEY`, Secret Key → `npx wrangler secret put TURNSTILE_SECRET_KEY`.
3. 미설정 시 검증을 건너뛴다(로컬 개발 포함).

## 5. 배포

```bash
cd main   && npm run deploy    # keywordream.com + www
cd ../keepup && npm run deploy # keepup.keywordream.com
```

첫 배포 시 커스텀 도메인이 자동 연결된다(존이 Active 상태여야 함).

**admin 계정**: `netkjy@gmail.com`으로 이메일 로그인하거나, 구글/네이버 로그인 시 해당 이메일이 오면 자동으로 admin이 된다 (`ADMIN_EMAIL` var).

## 6. 로컬 개발

```bash
# 터미널 1
cd main && npm run dev     # http://localhost:5173

# 터미널 2
cd keepup && npm run dev   # http://localhost:5174

# 최초 1회: 로컬 DB에 테이블 생성 (두 프로젝트가 ../.dev-state 를 공유)
cd main && npx wrangler d1 migrations apply keywordream-db --local --persist-to ../.dev-state
```

- localhost는 포트가 달라도 쿠키가 공유되므로, 5173에서 로그인하면 5174(keepup)에서도 로그인 상태가 된다.
- 로컬에서 소셜 로그인을 테스트하려면 `main/.dev.vars` 파일(커밋 금지)에 시크릿을 넣고,
  OAuth 콘솔에 `http://localhost:5173/api/auth/<provider>/callback`을 추가 등록한다.

```
# main/.dev.vars 예시
SITE_URL=http://localhost:5173
COOKIE_DOMAIN=
GOOGLE_CLIENT_SECRET=...
```

## 7. 배포 후 확인 체크리스트

- [ ] https://keywordream.com/api/health → `{"ok":true,...}`
- [ ] https://keepup.keywordream.com/api/health → `{"ok":true,...}`
- [ ] 메인에서 로그인 → keepup 헤더에 로그인 상태 표시(SSO)
- [ ] keepup 게시판 글쓰기(사진 포함) → 목록/상세 노출
- [ ] 응원 도장·댓글 동작, 마이페이지 이름 변경·탈퇴
- [ ] `netkjy@gmail.com` 로그인 → /admin 회원 목록 접근
