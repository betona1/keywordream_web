// 성과 인증 게시판 — 다크 히어로 + 인증샷 갤러리
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Stamp from "../components/Stamp";
import {
  api,
  fmtDate,
  loginUrl,
  mediaUrl,
  ROUTINE_TYPE_LABEL,
  type BoardStats,
  type Me,
  type PostCard,
  type PostListResponse,
} from "../lib/api";

/** 갤러리 히어로 배경 — 딥네이비 + 네온 글로우 (main 홈의 다크 존과 같은 톤) */
function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="animate-pulse-glow absolute -top-28 left-1/4 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-neon/20 blur-[110px]" />
      <div
        className="animate-pulse-glow absolute -bottom-32 right-0 h-[24rem] w-[24rem] rounded-full bg-stamp/15 blur-[110px]"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.16] [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_72%)]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(125,227,255,.28) 1px, transparent 1px), linear-gradient(90deg, rgba(125,227,255,.28) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
    </div>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-center">
      <div className="text-2xl font-extrabold tracking-tight text-neon-2 sm:text-3xl">{value}</div>
      <div className="mt-1 text-[11px] font-bold tracking-tight text-white/50 sm:text-xs">{label}</div>
    </div>
  );
}

export default function Stories({
  me,
  loading,
  mainUrl,
}: {
  me: Me;
  loading: boolean;
  mainUrl: string;
}) {
  const [posts, setPosts] = useState<PostCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [stats, setStats] = useState<BoardStats | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    void api<PostListResponse>(`/api/posts?page=${page}`).then((res) => {
      if (res.ok) {
        setPosts(res.data.posts);
        setTotal(res.data.total);
        setPageSize(res.data.pageSize);
        setStats(res.data.stats);
      }
      setFetched(true);
    });
  }, [page]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main>
      {/* ── 히어로 (다크) ─────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-night text-white">
        <HeroBackdrop />
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-16 text-center">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-neon">63 DAYS · HALL OF LOGS</p>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            63일을 <span className="text-neon-2">끝까지</span> 간 사람들
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/60">
            여기 올라온 사진은 전부 그날 그 시각에 찍힌 인증샷입니다. 남의 63일을 구경하고,
            부러우면 도장을 찍어 주세요.
          </p>

          {stats && (
            <div className="mx-auto mt-9 grid max-w-2xl grid-cols-3 gap-3">
              <StatTile value={stats.posts.toLocaleString()} label="완주 기록" />
              <StatTile value={stats.certs.toLocaleString()} label="쌓인 인증" />
              <StatTile value={stats.cheers.toLocaleString()} label="받은 도장" />
            </div>
          )}

          <div className="mt-9">
            {!loading &&
              (me ? (
                <Link
                  to="/stories/new"
                  className="inline-block rounded-2xl bg-gradient-to-r from-neon to-neon-2 px-6 py-3.5 text-sm font-bold text-night shadow-[0_0_32px_-6px_rgba(77,163,255,.75)] transition hover:brightness-110"
                >
                  + 내 성과 올리기
                </Link>
              ) : (
                <a
                  href={loginUrl(mainUrl, `${window.location.origin}/stories/new`)}
                  className="inline-block rounded-2xl border border-white/25 px-6 py-3.5 text-sm font-bold text-white/85 transition hover:border-neon hover:text-white"
                >
                  로그인하고 성과 올리기
                </a>
              ))}
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-neon/55 to-transparent" />
      </section>

      {/* ── 갤러리 (라이트) ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        {fetched && posts.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <Stamp size={72} label="1ST" />
            <p className="text-muted">
              아직 올라온 성과가 없습니다.
              <br />첫 번째 완주 기록의 주인공이 되어 보세요!
            </p>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              to={`/stories/${p.id}`}
              className="group overflow-hidden rounded-3xl border border-line bg-card shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-brand hover:shadow-[0_24px_50px_-24px_rgba(28,35,51,.45)]"
            >
              {/* 인증샷 */}
              <div className="relative aspect-4/3 overflow-hidden bg-ink">
                {p.coverKey ? (
                  <img
                    src={mediaUrl(p.coverKey)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-paper">
                    <Stamp size={56} />
                  </div>
                )}
                {/* 인증샷 자체에 루틴명·촬영시각 워터마크가 찍혀 있으므로 사진 위에 텍스트를 겹치지 않는다 */}
                <span className="absolute left-3 top-3 rounded-full bg-ink/65 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                  {ROUTINE_TYPE_LABEL[p.routineType]}
                </span>
                {p.achievedPercent != null && (
                  <span
                    className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-extrabold backdrop-blur ${
                      p.achievedPercent >= 100
                        ? "bg-stamp text-white"
                        : "bg-white/85 text-ink"
                    }`}
                  >
                    {p.achievedPercent >= 100 ? "100% 완주" : `${p.achievedPercent}%`}
                  </span>
                )}
              </div>

              <div className="p-5">
                <h2 className="line-clamp-2 font-extrabold leading-snug group-hover:text-brand">
                  {p.title}
                </h2>
                <p className="mt-1.5 truncate text-sm font-semibold text-brand">{p.routineName}</p>

                {(p.periodStart || p.certCount != null) && (
                  <p className="mt-1.5 text-xs text-muted">
                    {p.periodStart && p.periodEnd && (
                      <>
                        {p.periodStart.replace(/-/g, ".")} – {p.periodEnd.replace(/-/g, ".")}
                      </>
                    )}
                    {p.certCount != null && (
                      <>
                        {p.periodStart && p.periodEnd ? " · " : ""}인증 {p.certCount}회
                      </>
                    )}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
                  <span className="flex items-center gap-1.5 font-semibold">
                    {p.author.avatarUrl ? (
                      <img src={p.author.avatarUrl} alt="" className="h-5 w-5 rounded-full" />
                    ) : (
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-[9px] font-bold text-white">
                        {p.author.name.slice(0, 1)}
                      </span>
                    )}
                    {p.author.name}
                  </span>
                  <span className="flex items-center gap-2.5 font-bold">
                    {/* 응원 = 도장. 빨간 원 이모지 대신 앱과 같은 바브바브 도장을 쓴다 */}
                    <span className="flex items-center gap-1 text-stamp">
                      <Stamp size={16} />
                      {p.cheerCount}
                    </span>
                    <span>💬 {p.commentCount}</span>
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-muted">{fmtDate(p.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>

        {pages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-9 w-9 rounded-lg text-sm font-semibold ${
                  n === page ? "bg-brand text-white" : "bg-card text-muted hover:text-ink"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
