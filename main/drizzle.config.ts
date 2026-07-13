import { defineConfig } from "drizzle-kit";

// D1 스키마 마이그레이션 SQL 생성 전용 (npm run db:generate → ./drizzle/*.sql)
// 적용은 wrangler가 담당: wrangler d1 migrations apply keywordream-db --remote
// 주의: keepup 프로젝트도 같은 DB를 쓰지만, 마이그레이션은 이 프로젝트에서만 관리한다.
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
});
