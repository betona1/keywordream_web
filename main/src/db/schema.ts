// keywordream-db 스키마 (D1/SQLite, Drizzle)
// ⚠️ 이 파일이 원본. keepup 프로젝트의 src/db/schema.ts 는 이 파일의 사본이므로 항상 함께 수정할 것.
//    마이그레이션 생성(npm run db:generate)과 적용은 main 프로젝트에서만 한다.
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

// 응원 — 로그챌린지 시그니처인 '도장 찍기' (1인 1스탬프)
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

// 베타테스터 신청 (log.keywordream.com/beta)
// Play 비공개 테스트는 테스터의 '구글 계정 이메일'을 콘솔에 등록해야 하므로,
// 구글로 로그인한 계정의 이메일을 신청 시점에 그대로 복사해 둔다.
// 이메일은 관리자만 조회할 수 있고 공개 목록에는 노출하지 않는다.
export const betaTesters = sqliteTable(
  "beta_testers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    email: text("email").notNull(), // Play Console 등록용 (신청 당시 계정 이메일)
    device: text("device"), // 기기 모델 (예: Galaxy S24)
    note: text("note"), // 하고 싶은 말
    status: text("status", { enum: ["pending", "approved", "rejected"] })
      .notNull()
      .default("pending"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [uniqueIndex("idx_beta_testers_user").on(t.userId)], // 1인 1신청
);

// 앱 개선사항 게시판 (log.keywordream.com/feedback)
// 베타테스터·사용자가 버그·아이디어를 올리고, 관리자가 처리 상태와 답변을 남긴다.
export const feedbackPosts = sqliteTable(
  "feedback_posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    kind: text("kind", { enum: ["bug", "idea", "question"] }).notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    appVersion: text("app_version"), // 예: 1.2.0
    device: text("device"),
    status: text("status", {
      enum: ["open", "planned", "doing", "done", "wontfix"],
    })
      .notNull()
      .default("open"),
    adminReply: text("admin_reply"),
    repliedAt: integer("replied_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (t) => [index("idx_feedback_created").on(t.createdAt)],
);
