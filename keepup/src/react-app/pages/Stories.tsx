// 성과 인증 게시판 — 목록
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Stamp from "../components/Stamp";
import {
  api,
  fmtDate,
  loginUrl,
  mediaUrl,
  ROUTINE_TYPE_LABEL,
  type Me,
  type PostCard,
} from "../lib/api";

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
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    void api<{ posts: PostCard[]; total: number; page: number; pageSize: number }>(
      `/api/posts?page=${page}`,
    ).then((res) => {
      if (res.ok) {
        setPosts(res.data.posts);
        setTotal(res.data.total);
        setPageSize(res.data.pageSize);
      }
      setFetched(true);
    });
  }, [page]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">성과 게시판</h1>
          <p className="mt-2 text-sm text-muted">
            완주한 시즌의 기록을 자랑하고, 서로의 노력에 도장을 찍어 주세요.
          </p>
        </div>
        {!loading &&
          (me ? (
            <Link
              to="/stories/new"
              className="rounded-2xl bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-deep"
            >
              + 내 성과 올리기
            </Link>
          ) : (
            <a
              href={loginUrl(mainUrl, `${window.location.origin}/stories/new`)}
              className="rounded-2xl border border-line bg-card px-5 py-3 text-sm font-bold hover:border-brand"
            >
              로그인하고 성과 올리기
            </a>
          ))}
      </div>

      {fetched && posts.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <Stamp size={72} label="1ST" />
          <p className="text-muted">
            아직 올라온 성과가 없습니다.
            <br />첫 번째 완주 기록의 주인공이 되어 보세요!
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.id}
            to={`/stories/${p.id}`}
            className="group overflow-hidden rounded-2xl border border-line bg-card transition hover:border-brand"
          >
            <div className="relative aspect-[4/3] bg-paper">
              {p.coverKey ? (
                <img
                  src={mediaUrl(p.coverKey)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <Stamp size={56} />
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-bold text-white">
                {ROUTINE_TYPE_LABEL[p.routineType]}
              </span>
            </div>
            <div className="p-4">
              <h2 className="truncate font-extrabold group-hover:text-brand">{p.title}</h2>
              <p className="mt-0.5 truncate text-xs text-muted">{p.routineName}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold">
                {p.certCount != null && (
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-brand">
                    인증 {p.certCount}회
                  </span>
                )}
                {p.achievedPercent != null && (
                  <span className="rounded-full bg-stamp/10 px-2 py-0.5 text-stamp">
                    달성률 {p.achievedPercent}%
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  {p.author.avatarUrl ? (
                    <img src={p.author.avatarUrl} alt="" className="h-4 w-4 rounded-full" />
                  ) : (
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-brand text-[8px] font-bold text-white">
                      {p.author.name.slice(0, 1)}
                    </span>
                  )}
                  {p.author.name}
                </span>
                <span>
                  🔴 {p.cheerCount} · 💬 {p.commentCount} · {fmtDate(p.createdAt)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-8 w-8 rounded-lg text-sm font-semibold ${
                n === page ? "bg-brand text-white" : "bg-card text-muted hover:text-ink"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
