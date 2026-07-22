import { useEffect, useState } from "react";

// 베타 테스트 의견 페이지 (Play 비공개 테스트 '의견 URL' = log.keywordream.com/review)
// 테스터가 별점·의견을 남기고, 최신순으로 함께 볼 수 있다. (로그인 불필요)
type Review = {
  id: string;
  author: string;
  rating: number | null;
  body: string;
  createdAt: number;
};

function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange?: (n: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={onChange ? () => onChange(n) : undefined}
          className={`text-2xl leading-none ${
            onChange ? "cursor-pointer" : "cursor-default"
          } ${n <= value ? "text-stamp" : "text-line"}`}
          aria-label={`${n}점`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function timeAgo(ms: number) {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return "방금";
  if (s < 3600) return `${Math.floor(s / 60)}분 전`;
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
  return `${Math.floor(s / 86400)}일 전`;
}

export default function Review() {
  const [list, setList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/reviews");
      const json = await res.json();
      if (json?.ok) setList(json.data.reviews as Review[]);
    } catch {
      /* 무시 */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length < 2 || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          rating: rating || undefined,
          body: body.trim(),
        }),
      });
      const json = await res.json();
      if (json?.ok) {
        setBody("");
        setName("");
        setRating(0);
        setDone(true);
        await load();
        setTimeout(() => setDone(false), 2500);
      }
    } catch {
      /* 무시 */
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-stamp">
        베타 테스트 의견
      </p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight">
        로그챌린지를 써보고 의견을 남겨주세요 🙏
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        버그, 불편한 점, 좋았던 점 뭐든 좋아요. 여러분 의견으로 앱이 더 좋아집니다.
      </p>

      {/* 작성 폼 */}
      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-line bg-card p-5"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-ink">별점</span>
          <Stars value={rating} onChange={setRating} />
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          placeholder="닉네임 (선택)"
          className="mt-4 w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-[15px] outline-none focus:border-brand"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="의견을 자유롭게 적어주세요"
          className="mt-3 w-full resize-none rounded-xl border border-line bg-paper px-4 py-3 text-[15px] outline-none focus:border-brand"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted">
            {done ? "✅ 등록됐어요. 감사합니다!" : `${body.length}/1000`}
          </span>
          <button
            type="submit"
            disabled={sending || body.trim().length < 2}
            className="rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-brand disabled:opacity-40"
          >
            {sending ? "등록 중…" : "의견 남기기"}
          </button>
        </div>
      </form>

      {/* 의견 목록 */}
      <div className="mt-8">
        <h2 className="text-sm font-extrabold text-muted">
          남겨주신 의견 {list.length > 0 && `(${list.length})`}
        </h2>
        {loading ? (
          <p className="mt-4 text-sm text-muted">불러오는 중…</p>
        ) : list.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            아직 의견이 없어요. 첫 의견을 남겨주세요!
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {list.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-line bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-ink">{r.author}</span>
                  <span className="text-xs text-muted">
                    {timeAgo(r.createdAt)}
                  </span>
                </div>
                {r.rating ? (
                  <div className="mt-1">
                    <Stars value={r.rating} />
                  </div>
                ) : null}
                <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                  {r.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
