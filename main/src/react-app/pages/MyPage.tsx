// 마이페이지 — 프로필(이름 변경) / 로그아웃 / 회원 탈퇴
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, PROVIDER_LABEL, type Me } from "../lib/api";

export default function MyPage({
  me,
  loading,
  refresh,
  logout,
}: {
  me: Me;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !me) navigate("/login", { replace: true });
    if (me) setName(me.name);
  }, [me, loading, navigate]);

  if (loading || !me) return null;

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await api("/api/me", { method: "PATCH", body: JSON.stringify({ name }) });
    setBusy(false);
    if (res.ok) {
      await refresh();
      setMsg("이름을 변경했습니다.");
    } else {
      setMsg(`변경 실패: ${res.error}`);
    }
  };

  const doLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const doWithdraw = async () => {
    if (!confirm("정말 탈퇴할까요? 게시판에 쓴 글은 '탈퇴한 회원' 이름으로 남습니다.")) return;
    const res = await api("/api/me", { method: "DELETE" });
    if (res.ok) {
      await refresh();
      navigate("/", { replace: true });
    } else {
      setMsg(`탈퇴 실패: ${res.error}`);
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-extrabold tracking-tight">마이페이지</h1>

      <div className="mt-6 rounded-3xl border border-line bg-card p-6">
        <div className="flex items-center gap-4">
          {me.avatarUrl ? (
            <img src={me.avatarUrl} alt="" className="h-14 w-14 rounded-full" />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand text-xl font-bold text-white">
              {me.name.slice(0, 1)}
            </span>
          )}
          <div>
            <p className="font-extrabold">{me.name}</p>
            <p className="text-xs text-muted">
              {PROVIDER_LABEL[me.provider] ?? me.provider} 로그인
              {me.email ? ` · ${me.email}` : ""}
              {me.role === "admin" ? " · 관리자" : ""}
            </p>
          </div>
        </div>

        <form onSubmit={saveName} className="mt-6 space-y-2">
          <label className="text-xs font-semibold text-muted">표시 이름</label>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              required
              className="flex-1 rounded-xl border border-line bg-paper px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
            />
            <button
              disabled={busy || name.trim() === me.name}
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-50"
            >
              저장
            </button>
          </div>
        </form>
        {msg && <p className="mt-3 text-sm font-semibold text-brand">{msg}</p>}
      </div>

      <div className="mt-4 space-y-3 rounded-3xl border border-line bg-card p-6">
        <a
          href="https://log.keywordream.com/records"
          className="block text-sm font-bold text-brand hover:underline"
        >
          내 습관 기록 보기 (앱에서 올린 도장·사진) →
        </a>
        <a
          href="https://log.keywordream.com/stories"
          className="block text-sm font-bold text-brand hover:underline"
        >
          내가 활동하는 로그챌린지 성과 게시판 →
        </a>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={doLogout}
          className="rounded-xl border border-line bg-card px-5 py-2.5 text-sm font-semibold hover:border-ink"
        >
          로그아웃
        </button>
        <button onClick={doWithdraw} className="text-xs text-muted underline hover:text-stamp">
          회원 탈퇴
        </button>
      </div>
    </main>
  );
}
