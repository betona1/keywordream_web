// 성과 게시글 상세 — 이미지 / 본문 / 응원(도장) / 댓글
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Stamp from "../components/Stamp";
import {
  api,
  fmtDate,
  loginUrl,
  mediaUrl,
  ROUTINE_TYPE_LABEL,
  type Comment,
  type Me,
  type PostDetail,
} from "../lib/api";

export default function StoryDetail({ me, mainUrl }: { me: Me; mainUrl: string }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await api<{ post: PostDetail; comments: Comment[] }>(`/api/posts/${id}`);
    if (res.ok) {
      setPost(res.data.post);
      setComments(res.data.comments);
    } else {
      setNotFound(true);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (notFound)
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center text-muted">
        글을 찾을 수 없습니다.{" "}
        <Link to="/stories" className="font-bold text-brand hover:underline">
          목록으로 →
        </Link>
      </main>
    );
  if (!post) return null;

  const cheer = async () => {
    if (!me) {
      window.location.href = loginUrl(mainUrl);
      return;
    }
    const res = await api<{ cheered: boolean; count: number }>(`/api/posts/${post.id}/cheer`, {
      method: "POST",
    });
    if (res.ok) setPost({ ...post, myCheer: res.data.cheered, cheerCount: res.data.count });
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await api(`/api/posts/${post.id}/comments`, {
      method: "POST",
      body: JSON.stringify({ body: commentBody }),
    });
    setBusy(false);
    if (res.ok) {
      setCommentBody("");
      void load();
    }
  };

  const deletePost = async () => {
    if (!confirm("이 글을 삭제할까요?")) return;
    const res = await api(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) navigate("/stories");
  };

  const deleteComment = async (cid: number) => {
    if (!confirm("댓글을 삭제할까요?")) return;
    const res = await api(`/api/comments/${cid}`, { method: "DELETE" });
    if (res.ok) void load();
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/stories" className="text-sm font-semibold text-muted hover:text-ink">
        ← 성과 게시판
      </Link>

      <article className="mt-4 rounded-3xl border border-line bg-card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-bold text-brand">
              {ROUTINE_TYPE_LABEL[post.routineType]}
            </span>
            <h1 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight">
              {post.title}
            </h1>
            <p className="mt-1 text-sm text-muted">{post.routineName}</p>
          </div>
          {post.canModerate && (
            <button
              onClick={deletePost}
              className="shrink-0 text-xs text-muted underline hover:text-stamp"
            >
              삭제
            </button>
          )}
        </div>

        {/* 성과 요약 */}
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
          {post.periodStart && post.periodEnd && (
            <span className="rounded-full border border-line bg-paper px-3 py-1.5 text-muted">
              📅 {post.periodStart} ~ {post.periodEnd}
            </span>
          )}
          {post.certCount != null && (
            <span className="rounded-full bg-brand/10 px-3 py-1.5 text-brand">
              인증 {post.certCount}회
            </span>
          )}
          {post.achievedPercent != null && (
            <span className="rounded-full bg-stamp/10 px-3 py-1.5 text-stamp">
              달성률 {post.achievedPercent}%
            </span>
          )}
        </div>

        {/* 이미지 */}
        {post.images.length > 0 && (
          <div className={`mt-6 grid gap-3 ${post.images.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {post.images.map((k) => (
              <img
                key={k}
                src={mediaUrl(k)}
                alt=""
                className="w-full rounded-2xl border border-line object-cover"
              />
            ))}
          </div>
        )}

        <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed">{post.body}</p>

        <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
          <span className="flex items-center gap-2 text-sm text-muted">
            {post.author.avatarUrl ? (
              <img src={post.author.avatarUrl} alt="" className="h-7 w-7 rounded-full" />
            ) : (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                {post.author.name.slice(0, 1)}
              </span>
            )}
            <b className="text-ink">{post.author.name}</b> · {fmtDate(post.createdAt)}
          </span>

          {/* 응원 도장 */}
          <button
            onClick={cheer}
            className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-2 text-sm font-extrabold transition ${
              post.myCheer
                ? "border-stamp bg-stamp/10 text-stamp"
                : "border-line bg-card text-muted hover:border-stamp hover:text-stamp"
            }`}
            title={me ? "응원 도장 찍기" : "로그인하고 도장 찍기"}
          >
            <Stamp size={22} label="👍" className={post.myCheer ? "" : "opacity-40 grayscale"} />
            도장 {post.cheerCount}
          </button>
        </div>
      </article>

      {/* 댓글 */}
      <section className="mt-6">
        <h2 className="text-sm font-extrabold text-muted">댓글 {comments.length}</h2>
        <ul className="mt-3 space-y-3">
          {comments.map((cm) => (
            <li key={cm.id} className="rounded-2xl border border-line bg-card px-4 py-3">
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1.5 font-bold text-ink">
                  {cm.author.avatarUrl ? (
                    <img src={cm.author.avatarUrl} alt="" className="h-4 w-4 rounded-full" />
                  ) : (
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-brand text-[8px] font-bold text-white">
                      {cm.author.name.slice(0, 1)}
                    </span>
                  )}
                  {cm.author.name}
                </span>
                <span className="flex items-center gap-2">
                  {fmtDate(cm.createdAt)}
                  {(cm.mine || me?.role === "admin") && (
                    <button
                      onClick={() => deleteComment(cm.id)}
                      className="underline hover:text-stamp"
                    >
                      삭제
                    </button>
                  )}
                </span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm">{cm.body}</p>
            </li>
          ))}
        </ul>

        {me ? (
          <form onSubmit={submitComment} className="mt-4 flex gap-2">
            <input
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              maxLength={1000}
              required
              placeholder="응원의 한마디를 남겨 주세요"
              className="flex-1 rounded-xl border border-line bg-card px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
            />
            <button
              disabled={busy || !commentBody.trim()}
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-50"
            >
              등록
            </button>
          </form>
        ) : (
          <p className="mt-4 text-center text-sm text-muted">
            <a href={loginUrl(mainUrl)} className="font-bold text-brand hover:underline">
              로그인
            </a>
            하고 응원 댓글을 남겨 보세요.
          </p>
        )}
      </section>
    </main>
  );
}
