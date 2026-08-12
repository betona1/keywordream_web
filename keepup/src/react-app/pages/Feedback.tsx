// 앱 개선사항 게시판 — 베타테스터·사용자가 버그·제안·질문을 올리고 처리 상태를 함께 본다.
// 열람은 누구나, 작성은 로그인 필요. 상태 변경·답변은 관리자만.
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  api,
  fmtDate,
  loginUrl,
  APP_VERSION,
  FEEDBACK_KIND_LABEL,
  FEEDBACK_STATUS_LABEL,
  type FeedbackItem,
  type FeedbackKind,
  type FeedbackListResponse,
  type FeedbackStatus,
  type Me,
} from "../lib/api";

const KIND_STYLE: Record<FeedbackKind, string> = {
  bug: "bg-stamp/12 text-stamp",
  idea: "bg-brand/10 text-brand",
  question: "bg-muted/12 text-muted",
};

const STATUS_STYLE: Record<FeedbackStatus, string> = {
  open: "border-line text-muted",
  planned: "border-brand/40 text-brand",
  doing: "border-stamp/40 text-stamp",
  done: "border-success/45 text-success",
  wontfix: "border-line text-muted line-through",
};

const STATUSES: FeedbackStatus[] = ["open", "planned", "doing", "done", "wontfix"];

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-center">
      <div className="text-2xl font-extrabold tracking-tight text-stamp-accent sm:text-3xl">
        {value.toLocaleString()}
      </div>
      <div className="mt-1 text-[11px] font-bold tracking-tight text-white/50 sm:text-xs">
        {label}
      </div>
    </div>
  );
}

export default function Feedback({ me, mainUrl }: { me: Me; mainUrl: string }) {
  const [data, setData] = useState<FeedbackListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<FeedbackKind>("idea");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [appVersion, setAppVersion] = useState(APP_VERSION);
  const [device, setDevice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await api<FeedbackListResponse>(`/api/feedback?page=${page}`);
    if (res.ok) setData(res.data);
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await api("/api/feedback", {
      method: "POST",
      body: JSON.stringify({
        kind,
        title: title.trim(),
        body: body.trim(),
        appVersion: appVersion.trim(),
        device: device.trim(),
      }),
    });
    setBusy(false);
    if (res.ok) {
      setTitle("");
      setBody("");
      setDevice("");
      setOpen(false);
      setPage(1);
      void load();
    } else {
      setError("등록에 실패했습니다. 제목 2자·내용 5자 이상인지 확인해 주세요.");
    }
  };

  const patch = async (id: number, payload: Record<string, unknown>) => {
    const res = await api(`/api/feedback/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    if (res.ok) void load();
  };

  const remove = async (id: number) => {
    if (!confirm("이 글을 삭제할까요?")) return;
    const res = await api(`/api/feedback/${id}`, { method: "DELETE" });
    if (res.ok) void load();
  };

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <main>
      {/* 히어로 */}
      <section className="relative isolate overflow-hidden bg-night text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <div className="animate-pulse-glow absolute -top-28 left-1/4 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-brand/25 blur-[110px]" />
          <div
            className="animate-pulse-glow absolute -bottom-32 right-0 h-[22rem] w-[22rem] rounded-full bg-stamp/20 blur-[110px]"
            style={{ animationDelay: "1.8s" }}
          />
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-14 pt-16 text-center">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-neon">MAKE IT BETTER</p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            앱 개선사항 게시판
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/65">
            불편한 점, 있으면 좋겠는 기능, 버그를 올려 주세요. 1인 스튜디오라 의사결정이 짧습니다 —
            올려 주신 의견이 다음 업데이트에 그대로 들어갑니다.
          </p>

          {data && (
            <div className="mx-auto mt-9 grid max-w-lg grid-cols-3 gap-3">
              <StatTile value={data.stats.total} label="올라온 의견" />
              <StatTile value={data.stats.replied} label="답변 완료" />
              <StatTile value={data.stats.done} label="반영 완료" />
            </div>
          )}

          <div className="mt-9">
            {me ? (
              <button
                onClick={() => setOpen((v) => !v)}
                className="rounded-2xl bg-gradient-to-r from-stamp to-stamp-accent px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_32px_-6px_rgba(124,92,255,.7)] transition hover:brightness-110"
              >
                {open ? "닫기" : "+ 의견 올리기"}
              </button>
            ) : (
              <a
                href={loginUrl(mainUrl, `${window.location.origin}/feedback`)}
                className="inline-block rounded-2xl border border-white/25 px-6 py-3.5 text-sm font-bold text-white/85 transition hover:border-stamp-accent hover:text-white"
              >
                로그인하고 의견 올리기
              </a>
            )}
          </div>
          <p className="mt-4 text-xs text-white/40">
            베타테스터를 찾고 계신가요?{" "}
            <Link to="/beta" className="font-bold text-stamp-accent hover:underline">
              모집 안내 보기 →
            </Link>
          </p>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-stamp/60 to-transparent" />
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        {/* 작성 폼 */}
        {open && me && (
          <form onSubmit={submit} className="mb-10 rounded-3xl border border-line bg-card p-6 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(FEEDBACK_KIND_LABEL) as FeedbackKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                    kind === k ? KIND_STYLE[k] : "bg-paper text-muted hover:text-ink"
                  }`}
                >
                  {FEEDBACK_KIND_LABEL[k]}
                </button>
              ))}
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              required
              placeholder="제목 — 예: 인증 사진을 여러 장 올리고 싶어요"
              className="mt-4 w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-semibold focus:border-brand focus:outline-none"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={3000}
              required
              rows={5}
              placeholder="어떤 상황에서 불편했는지, 어떻게 바뀌면 좋겠는지 적어 주세요. 버그라면 재현 순서를 알려 주시면 큰 도움이 됩니다."
              className="mt-3 w-full resize-y rounded-xl border border-line bg-card px-4 py-3 text-sm focus:border-brand focus:outline-none"
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                value={appVersion}
                onChange={(e) => setAppVersion(e.target.value)}
                maxLength={20}
                placeholder="앱 버전 (예: 1.2.0)"
                className="rounded-xl border border-line bg-card px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
              />
              <input
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                maxLength={60}
                placeholder="기기 (예: Galaxy S24)"
                className="rounded-xl border border-line bg-card px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
              />
            </div>

            {error && <p className="mt-3 text-sm font-semibold text-stamp">{error}</p>}

            <div className="mt-5 flex gap-2">
              <button
                disabled={busy}
                className="rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-deep disabled:opacity-50"
              >
                {busy ? "등록 중…" : "등록"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-line px-5 py-3 text-sm font-bold text-muted hover:text-ink"
              >
                취소
              </button>
            </div>
          </form>
        )}

        {/* 목록 */}
        {data && data.items.length === 0 && (
          <p className="py-16 text-center text-muted">
            아직 올라온 의견이 없습니다.
            <br />첫 의견을 남겨 주세요.
          </p>
        )}

        <ul className="space-y-4">
          {data?.items.map((it) => (
            <li key={it.id} className="rounded-3xl border border-line bg-card p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${KIND_STYLE[it.kind]}`}>
                  {FEEDBACK_KIND_LABEL[it.kind]}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[it.status]}`}
                >
                  {FEEDBACK_STATUS_LABEL[it.status]}
                </span>
                {it.appVersion && (
                  <span className="text-[11px] font-semibold text-muted">v{it.appVersion}</span>
                )}
                {it.device && <span className="text-[11px] text-muted">· {it.device}</span>}
              </div>

              <h2 className="mt-3 font-extrabold leading-snug tracking-tight">{it.title}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">{it.body}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs text-muted">
                <span className="font-semibold">
                  {it.author.name} · {fmtDate(it.createdAt)}
                </span>
                {(it.mine || data.canModerate) && (
                  <button onClick={() => remove(it.id)} className="underline hover:text-stamp">
                    삭제
                  </button>
                )}
              </div>

              {/* 운영자 답변 */}
              {it.adminReply && (
                <div className="mt-4 rounded-2xl bg-stamp-soft px-4 py-3">
                  <p className="text-xs font-extrabold text-stamp">운영자 답변</p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">
                    {it.adminReply}
                  </p>
                </div>
              )}

              {/* 관리자 도구 */}
              {data.canModerate && (
                <div className="mt-4 space-y-2 rounded-2xl bg-paper p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => patch(it.id, { status: s })}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                          it.status === s ? "border-brand bg-brand text-white" : "border-line text-muted hover:text-ink"
                        }`}
                      >
                        {FEEDBACK_STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const el = (e.currentTarget.elements.namedItem("reply") as HTMLInputElement);
                      void patch(it.id, { adminReply: el.value });
                    }}
                    className="flex gap-2"
                  >
                    <input
                      name="reply"
                      defaultValue={it.adminReply ?? ""}
                      maxLength={2000}
                      placeholder="답변 남기기"
                      className="flex-1 rounded-xl border border-line bg-card px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    />
                    <button className="rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white">
                      저장
                    </button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>

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
