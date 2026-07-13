// keywordream-db 스키마 (D1/SQLite, Drizzle)
// ⚠️ 사본 — 원본은 main/src/db/schema.ts. 수정은 반드시 main에서 하고 이 파일로 복사할 것.
//    마이그레이션 생성·적용도 main 프로젝트에서만 한다.
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// 회원 — keywordream.com 에서 가입/로그인, keepup 게시판에서 공용 사용
export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    provider: text("provider", {
      enum: ["google", "kakao", "naver", "email"],
    }).notNull(),
    providerId: text("provider_id").notNull(),
    email: text("email"), // 제공자가 주는 경우만 저장 (admin 시드 판별·연락용)
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    role: text("role", { enum: ["member", "admin"] })
      .notNull()
      .default("member"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp" }), // 탈퇴(소프트 삭제)
  },
  (t) => [uniqueIndex("idx_users_provider").on(t.provider, t.providerId)],
);

// 성과 인증 게시판 (keepup.keywordream.com/stories)
export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    routineType: text("routine_type", { enum: ["stack", "goal"] }).notNull(), // 적립형 | 결과형
    title: text("title").notNull(),
    routineName: text("routine_name").notNull(), // 어떤 루틴이었는지 (예: 매일 10km 걷기)
    periodStart: text("period_start"), // YYYY-MM-DD
    periodEnd: text("period_end"), // YYYY-MM-DD
    certCount: integer("cert_count"), // 총 인증 횟수
    achievedPercent: integer("achieved_percent"), // 달성률 %
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (t) => [index("idx_posts_created").on(t.createdAt)],
);

export const postImages = sqliteTable(
  "post_images",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id),
    fileKey: text("file_key").notNull(), // R2 키 (stories/<postId>/<uuid>.<ext>)
    sort: integer("sort").notNull().default(0),
  },
  (t) => [index("idx_post_images_post").on(t.postId)],
);

export const postComments = sqliteTable(
  "post_comments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (t) => [index("idx_post_comments_post").on(t.postId)],
);

// 습관 명언 — 관리자가 등록, KeepUp 앱이 /api/quotes로 받아 내장 명언과 병합
export const quotes = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  author: text("author").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// 응원 — KeepUp 시그니처인 '도장 찍기' (1인 1스탬프)
export const postCheers = sqliteTable(
  "post_cheers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [uniqueIndex("idx_post_cheers_unique").on(t.postId, t.userId)],
);
