# keywordream 웹 (keywordream.com + keepup.keywordream.com)

KeepUp 앱(`E:\app\keepup`, 별도 저장소)의 웹 생태계. **Cloudflare Workers + D1 + KV + R2** 무료 티어 기반.
전체 기획은 앱 저장소의 `CLAUDE.md`(마스터 기획서) 5절 참고. 배포/셋업 절차는 [SETUP.md](./SETUP.md).

```
main/    keywordream.com          브랜드 랜딩 + 간편로그인(구글/카카오/네이버/이메일) + 회원관리(마이페이지/관리자)
keepup/  keepup.keywordream.com   KeepUp 홍보 + 성과 인증 게시판(사진 업로드) + 법적/문의 페이지
```

## 아키텍처 요점

- **스택**: React 19 + Vite + Tailwind 4 (프론트) / Hono + Drizzle (워커) — exansys.net에서 검증된 구조 포팅.
- **SSO**: 로그인·세션 발급은 main에서만. 세션 쿠키를 `Domain=.keywordream.com`으로 발급하고,
  두 워커가 **같은 KV(SESSIONS)·같은 D1(keywordream-db)** 을 바인딩해 keepup이 로그인 상태를 인식한다.
- **DB 스키마**: 원본은 `main/src/db/schema.ts`. `keepup/src/db/schema.ts`는 사본이므로 항상 같이 수정.
  마이그레이션 생성·적용은 main에서만 (`npm run db:generate`).
- **이미지**: keepup 워커가 R2(`keepup-media`)에 저장/서빙 (`/api/media/stories/...`).
- **역할**: member / admin. `ADMIN_EMAIL`(netkjy@gmail.com) 계정은 로그인 시 자동 admin.

## 개발 명령 (각 폴더에서)

```bash
npm run dev      # 로컬 개발 (main: 5173, keepup: 5174 — 로컬 D1/KV는 ../.dev-state 공유)
npm run check    # 타입체크 (프론트 + 워커)
npm run build    # 프로덕션 빌드
npm run deploy   # 빌드 + Cloudflare 배포
```
