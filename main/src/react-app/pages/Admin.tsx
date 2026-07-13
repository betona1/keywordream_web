// 관리자 — 회원 목록 / 검색 / 역할 변경
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, PROVIDER_LABEL, type Me } from "../lib/api";

type QuoteRow = { id: number; text: string; author: string };

type UserRow = {
  id: number;
  provider: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
  role: "member" | "admin";
  createdAt: string;
  deleted: boolean;
};

export default function Admin({ me, loading }: { me: Me; loading: boolean }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [quoteText, setQuoteText] = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");
  const [quoteBusy, setQuoteBusy] = useState(false);

  useEffect(() => {
    if (!loading && (!me || me.role !== "admin")) navigate("/", { replace: true });
  }, [me, loading, navigate]);

  const load = useCallback(async () => {
    const res = await api<{ users: UserRow[]; total: number; page: number; pageSize: number }>(
      `/api/admin/users?page=${page}&q=${encodeURIComponent(search)}`,
    );
    if (res.ok) {
      setRows(res.data.users);
      setTotal(res.data.total);
      setPageSize(res.data.pageSize);
    }
  }, [page, search]);

  const loadQuotes = useCallback(async () => {
    const res = await api<{ quotes: QuoteRow[] }>("/api/admin/quotes");
    if (res.ok) setQuotes(res.data.quotes);
  }, []);

  useEffect(() => {
    if (me?.role === "admin") {
      void load();
      void loadQuotes();
    }
  }, [me, load, loadQuotes]);

  const addQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteBusy(true);
    const res = await api("/api/admin/quotes", {
      method: "POST",
      body: JSON.stringify({ text: quoteText, author: quoteAuthor }),
    });
    setQuoteBusy(false);
    if (res.ok) {
      setQuoteText("");
      setQuoteAuthor("");
      void loadQuotes();
    } else {
      alert(`등록 실패: ${res.error}`);
    }
  };

  const deleteQuote = async (id: number) => {
    if (!confirm("이 명언을 삭제할까요?")) return;
    const res = await api(`/api/admin/quotes/${id}`, { method: "DELETE" });
    if (res.ok) void loadQuotes();
  };

  const changeRole = async (u: UserRow) => {
    const role = u.role === "admin" ? "member" : "admin";
    if (!confirm(`${u.name} 님을 ${role === "admin" ? "관리자로 지정" : "일반 회원으로 변경"}할까요?`))
      return;
    const res = await api(`/api/admin/users/${u.id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    if (res.ok) void load();
    else alert(`변경 실패: ${res.error}`);
  };

  if (loading || !me || me.role !== "admin") return null;

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">회원 관리</h1>
        <p className="text-sm text-muted">총 {total}명</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(q);
        }}
        className="mt-5 flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="이름 또는 이메일 검색"
          className="flex-1 rounded-xl border border-line bg-card px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
        />
        <button className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep">
          검색
        </button>
      </form>

      <ul className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {rows.map((u) => (
          <li key={u.id} className="flex items-center gap-3 px-4 py-3">
            {u.avatarUrl ? (
              <img src={u.avatarUrl} alt="" className="h-9 w-9 rounded-full" />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                {u.name.slice(0, 1)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">
                {u.name}
                {u.deleted && <span className="ml-2 text-xs font-semibold text-muted">(탈퇴)</span>}
              </p>
              <p className="truncate text-xs text-muted">
                #{u.id} · {PROVIDER_LABEL[u.provider] ?? u.provider}
                {u.email ? ` · ${u.email}` : ""} ·{" "}
                {new Date(u.createdAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <button
              onClick={() => changeRole(u)}
              disabled={u.id === me.id}
              className={`rounded-full px-3 py-1 text-xs font-bold transition disabled:opacity-40 ${
                u.role === "admin"
                  ? "bg-stamp/10 text-stamp hover:bg-stamp/20"
                  : "bg-paper text-muted hover:text-ink"
              }`}
            >
              {u.role === "admin" ? "관리자" : "member"}
            </button>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-muted">회원이 없습니다.</li>
        )}
      </ul>

      {pages > 1 && (
        <div className="mt-5 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-lg text-sm font-semibold ${
                p === page ? "bg-brand text-white" : "bg-card text-muted hover:text-ink"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* KeepUp 앱 '오늘의 명언' 관리 — 앱 내장 10개 + 여기서 추가한 것이 합쳐져 매일 순환 */}
      <div className="mt-12 flex items-end justify-between">
        <h2 className="text-xl font-extrabold tracking-tight">명언 관리 (KeepUp 앱)</h2>
        <p className="text-sm text-muted">{quotes.length}개 등록됨</p>
      </div>
      <p className="mt-1 text-xs text-muted">
        앱의 "오늘의 명언"에 추가됩니다. 앱은 12시간마다 새 명언을 받아갑니다.
      </p>

      <form onSubmit={addQuote} className="mt-4 space-y-2 rounded-2xl border border-line bg-card p-4">
        <input
          value={quoteText}
          onChange={(e) => setQuoteText(e.target.value)}
          required
          maxLength={300}
          placeholder="명언 내용 (예: 습관은 복리다.)"
          className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
        />
        <div className="flex gap-2">
          <input
            value={quoteAuthor}
            onChange={(e) => setQuoteAuthor(e.target.value)}
            required
            maxLength={60}
            placeholder="출처/인물 (예: 제임스 클리어)"
            className="flex-1 rounded-xl border border-line bg-paper px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
          />
          <button
            disabled={quoteBusy}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-50"
          >
            추가
          </button>
        </div>
      </form>

      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {quotes.map((qt) => (
          <li key={qt.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm">“{qt.text}”</p>
              <p className="mt-0.5 text-xs font-semibold text-muted">— {qt.author}</p>
            </div>
            <button
              onClick={() => deleteQuote(qt.id)}
              className="shrink-0 text-xs text-muted underline hover:text-stamp"
            >
              삭제
            </button>
          </li>
        ))}
        {quotes.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-muted">
            아직 추가한 명언이 없습니다. (앱 내장 명언 10개는 항상 표시됩니다)
          </li>
        )}
      </ul>
    </main>
  );
}
