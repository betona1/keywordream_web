// 성과 게시판 목업 시드 — 가상 유저·완주 게시물·인증샷·댓글·응원(도장)을 넣는다.
//
//   node scripts/gen-mock-images.mjs   # 인증샷 먼저 생성
//   node scripts/seed-mock.mjs         # 로컬 개발 DB(.dev-state)에 시드
//   node scripts/seed-mock.mjs --remote  # ⚠️ 프로덕션 D1/R2에 시드 (가짜 후기가 실제 방문자에게 보인다)
//   node scripts/seed-mock.mjs --clean   # 목업만 삭제
//
//   --hide-existing    기존(목업 아닌) 게시물을 게시판에서 감춘다. 소프트 삭제라 되돌릴 수 있고,
//                      감추기 전에 scripts/.existing-backup-*.json 으로 내용을 덤프해 둔다.
//   --unhide-existing  위를 되돌린다.
//
// 목업은 id 9001~9999 대역만 쓰므로, 실제 사용자 데이터를 건드리지 않고 통째로 지울 수 있다.
import { execFileSync } from "node:child_process";
import { writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { USERS, POSTS, shotsOf, MOCK_PREFIX } from "./mock-data.mjs";

const REMOTE = process.argv.includes("--remote");
const CLEAN_ONLY = process.argv.includes("--clean");
const HIDE_EXISTING = process.argv.includes("--hide-existing");
const UNHIDE_EXISTING = process.argv.includes("--unhide-existing");
const ID_BASE = 9001;
const BUCKET = "keepup-media";
const DB = "keywordream-db";

const dir = (p) => fileURLToPath(new URL(p, import.meta.url));
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const nul = (v) => (v === null || v === undefined || v === "" ? "NULL" : q(v));
const ts = (iso) => Math.floor(Date.parse(iso) / 1000);

/** wrangler 공통 플래그 — 로컬은 vite와 같은 상태 폴더(.dev-state)를 봐야 한다 */
const target = REMOTE ? ["--remote"] : ["--local", "--persist-to=../.dev-state"];

function wrangler(args) {
  return execFileSync("npx", ["wrangler", ...args], {
    cwd: dir("../"),
    encoding: "utf8",
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/** wrangler d1 execute --json 결과에서 첫 쿼리의 행들을 꺼낸다 */
function d1Query(command) {
  const out = wrangler(["d1", "execute", DB, ...target, "--json", "--yes", `--command="${command}"`]);
  return JSON.parse(out.slice(out.indexOf("[")))[0]?.results ?? [];
}

/** 기존(목업 아닌) 게시물을 감추기 전에 내용을 파일로 남긴다 — 되돌릴 근거가 있어야 한다 */
function backupExisting() {
  const rows = d1Query(
    `SELECT p.id, p.title, p.routine_name, p.body, p.created_at, p.deleted_at, u.name author ` +
      `FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id < ${ID_BASE} ORDER BY p.id`,
  );
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const file = dir(`./.existing-backup-${REMOTE ? "remote" : "local"}-${stamp}.json`);
  writeFileSync(file, JSON.stringify(rows, null, 2), "utf8");
  console.log(`   기존 게시물 ${rows.length}건을 백업했습니다 → ${file.split(/[\\/]/).pop()}`);
  return rows;
}

/** 목업 id 대역(9001~)이 실제 데이터와 겹치면 DELETE가 남의 글을 지운다 — 쓰기 전에 막는다 */
function assertIdRangeFree() {
  // 목업 대역은 빼고 본다 — 재실행할 때 자기가 넣은 목업을 실제 데이터로 오인하면 안 된다
  const [row] = d1Query(
    `SELECT (SELECT coalesce(max(id),0) FROM posts WHERE id < ${ID_BASE}) p, ` +
      `(SELECT coalesce(max(id),0) FROM users WHERE id < ${ID_BASE}) u`,
  );
  if (!row) throw new Error("현재 데이터 상태를 확인하지 못했습니다.");
  const realMax = Math.max(row.p, row.u);
  console.log(`   실제 데이터 최대 id — posts ${row.p}, users ${row.u}`);
  if (realMax >= ID_BASE) {
    throw new Error(
      `실제 데이터가 목업 대역(${ID_BASE}~)까지 올라와 있습니다. ID_BASE를 ${realMax + 1000} 이상으로 올린 뒤 다시 실행하세요.`,
    );
  }
}

if (REMOTE) {
  console.log("⚠️  프로덕션(원격) D1/R2에 씁니다 — 가짜 후기가 실제 방문자에게 보입니다.");
  console.log("    되돌리려면: node scripts/seed-mock.mjs --clean --remote");
}
console.log(`[0/2] 대상 점검 ${REMOTE ? "(원격)" : "(로컬)"}`);
assertIdRangeFree();

// 기존 글 감추기/되살리기는 단독으로도 쓸 수 있다
if (UNHIDE_EXISTING) {
  wrangler([
    "d1", "execute", DB, ...target, "--yes",
    `--command="UPDATE posts SET deleted_at = NULL WHERE id < ${ID_BASE}"`,
  ]);
  console.log("기존 게시물을 다시 노출했습니다.");
  process.exit(0);
}

// ── SQL 조립 ────────────────────────────────────────────────────────
const sql = [];

// 재실행 가능하게 — 목업 대역을 먼저 비운다 (참조 순서 주의)
sql.push(`DELETE FROM post_cheers WHERE post_id >= ${ID_BASE};`);
sql.push(`DELETE FROM post_comments WHERE post_id >= ${ID_BASE};`);
sql.push(`DELETE FROM post_images WHERE post_id >= ${ID_BASE};`);
sql.push(`DELETE FROM posts WHERE id >= ${ID_BASE};`);
sql.push(`DELETE FROM users WHERE id >= ${ID_BASE};`);

// 기존 글 감추기 — 하드 삭제가 아니라 소프트 삭제(deleted_at)로, 언제든 --unhide-existing 으로 되돌린다
if (HIDE_EXISTING && !CLEAN_ONLY) {
  backupExisting();
  sql.push(
    `UPDATE posts SET deleted_at = ${Math.floor(Date.now() / 1000)} ` +
      `WHERE id < ${ID_BASE} AND deleted_at IS NULL;`,
  );
}

if (!CLEAN_ONLY) {
  const userId = (i) => ID_BASE + i;
  const postId = (i) => ID_BASE + i;
  const joined = ts("2026-02-01T10:00:00+09:00");

  USERS.forEach((name, i) => {
    sql.push(
      `INSERT INTO users (id, provider, provider_id, email, name, avatar_url, role, created_at) VALUES ` +
        `(${userId(i)}, 'email', ${q(MOCK_PREFIX + i)}, NULL, ${q(name)}, NULL, 'member', ${joined + i * 3600});`,
    );
  });

  POSTS.forEach((p, i) => {
    const created = ts(p.createdAt);
    sql.push(
      `INSERT INTO posts (id, user_id, routine_type, title, routine_name, period_start, period_end, cert_count, achieved_percent, body, created_at) VALUES ` +
        `(${postId(i)}, ${userId(p.author)}, ${q(p.routineType)}, ${q(p.title)}, ${q(p.routineName)}, ` +
        `${nul(p.periodStart)}, ${nul(p.periodEnd)}, ${p.certCount}, ${p.achievedPercent}, ${q(p.body)}, ${created});`,
    );

    shotsOf(p).forEach((shot) => {
      sql.push(
        `INSERT INTO post_images (post_id, file_key, sort) VALUES ` +
          `(${postId(i)}, ${q(`stories/${postId(i)}/shot-${shot.index}.webp`)}, ${shot.index});`,
      );
    });

    // 댓글 — 게시 직후부터 며칠에 걸쳐 하나씩 달린 것처럼
    p.comments.forEach(([who, body], k) => {
      sql.push(
        `INSERT INTO post_comments (post_id, user_id, body, created_at) VALUES ` +
          `(${postId(i)}, ${userId(who)}, ${q(body)}, ${created + (k + 1) * 5400 + i * 600});`,
      );
    });

    // 응원(도장) — 작성자를 뺀 나머지에서 결정론적으로 고른다
    let placed = 0;
    for (let s = 0; placed < p.cheers && s < USERS.length; s++) {
      const who = (s * 7 + i * 5) % USERS.length;
      if (who === p.author) continue;
      sql.push(
        `INSERT OR IGNORE INTO post_cheers (post_id, user_id, created_at) VALUES ` +
          `(${postId(i)}, ${userId(who)}, ${created + placed * 900});`,
      );
      placed++;
    }
  });
}

const sqlFile = dir("./.mock-seed.sql");
writeFileSync(sqlFile, sql.join("\n"), "utf8");

console.log(`[1/2] D1 ${REMOTE ? "(원격)" : "(로컬)"} 적용 — 구문 ${sql.length}개`);
wrangler(["d1", "execute", DB, ...target, `--file=${sqlFile}`, "--yes"]);

if (CLEAN_ONLY) {
  console.log("목업 데이터를 삭제했습니다. (R2 인증샷은 남아 있어도 참조되지 않습니다)");
  process.exit(0);
}

// ── R2 인증샷 업로드 ────────────────────────────────────────────────
const uploads = [];
POSTS.forEach((p, i) => {
  shotsOf(p).forEach((shot) => {
    uploads.push({
      key: `stories/${ID_BASE + i}/shot-${shot.index}.webp`,
      file: dir(`./.mock-images/${i}-${shot.index}.webp`),
    });
  });
});

const missing = uploads.filter((u) => !existsSync(u.file));
if (missing.length > 0) {
  console.error(`인증샷이 없습니다. 먼저 실행하세요: node scripts/gen-mock-images.mjs`);
  process.exit(1);
}

console.log(`[2/2] R2 업로드 — ${uploads.length}장 (wrangler 호출당 몇 초 걸립니다)`);
const CONCURRENCY = 4;
let done = 0;
async function worker(queue) {
  while (queue.length > 0) {
    const u = queue.shift();
    wrangler([
      "r2", "object", "put", `${BUCKET}/${u.key}`,
      `--file=${u.file}`, "--content-type=image/webp", ...target,
    ]);
    done++;
    process.stdout.write(`\r  ${done}/${uploads.length}`);
  }
}
const queue = [...uploads];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));

console.log(`\n완료 — 게시물 ${POSTS.length}개, 유저 ${USERS.length}명, 인증샷 ${uploads.length}장`);
