// 베타테스터 신청 관리 (관리자 전용) — 승인/보류 처리와 Play Console 붙여넣기용 이메일 복사.
// ⚠️ 이 화면에는 신청자 이메일이 보인다. 서버에서도 admin이 아니면 403이므로 URL을 알아도 열리지 않는다.
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  api,
  fmtDate,
  loginUrl,
  BETA_STATUS_LABEL,
  type BetaStatus,
  type BetaTesterRow,
  type Me,
} from "../lib/api";

const STATUSES: BetaStatus[] = ["pending", "approved", "rejected"];

const STATUS_STYLE: Record<BetaStatus, string> = {
  pending: "border-stamp/45 text-stamp",
  approved: "border-success/50 text-success",
  rejected: "border-line text-muted",
};

export default function BetaAdmin({ me, mainUrl }: { me: Me; mainUrl: string }) {
  const [rows, setRows] = useState<BetaTesterRow[] | null>(null);
  const [denied, setDenied] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await api<{ testers: BetaTesterRow[] }>("/api/beta");
    if (res.ok) {
      setRows(res.data.testers);
      setDenied(false);
    } else {
      setDenied(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, me]);

  const setStatus = async (id: number, status: BetaStatus) => {
    const res = await api(`/api/beta/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    if (res.ok) void load();
  };

  /** Play Console 테스터 목록은 줄바꿈으로 구분된 이메일을 그대로 받는다 */
  const copyEmails = async (only: BetaStatus | "all") => {
    if (!rows) return;
    const list = (only === "all" ? rows : rows.filter((r) => r.status === only)).map((r) => r.email);
    if (list.length === 0) {
      setCopied("복사할 이메일이 없습니다.");
      return;
    }
    try {
      await navigator.clipboard.writeText(list.join("\n"));
      setCopied(`${list.length}개 이메일을 복사했습니다.`);
    } catch {
      setCopied("복사에 실패했습니다. 아래 목록에서 직접 선택해 복사해 주세요.");
    }
    setTimeout(() => setCopied(null), 4000);
  };

  if (!me) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-muted">관리자 로그인이 필요합니다.</p>
        <a
          href={loginUrl(mainUrl, `${window.location.origin}/beta/manage`)}
          className="mt-5 inline-block rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-deep"
        >
          로그인
        </a>
      </main>
    );
  }

  if (denied) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center text-muted">
        접근 권한이 없습니다.{" "}
        <Link to="/beta" className="font-bold text-brand hover:underline">
          모집 안내로 →
        </Link>
      </main>
    );
  }

  const counts = {
    all: rows?.length ?? 0,
    pending: rows?.filter((r) => r.status === "pending").length ?? 0,
    approved: rows?.filter((r) => r.status === "approved").length ?? 0,
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">베타테스터 신청 관리</h1>
          <p className="mt-2 text-sm text-muted">
            신청 {counts.all}건 · 확인 중 {counts.pending} · 승인 {counts.approved}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => copyEmails("approved")}
            className="rounded-2xl bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-deep"
          >
            승인자 이메일 복사
          </button>
          <button
            onClick={() => copyEmails("all")}
            className="rounded-2xl border border-line px-4 py-2.5 text-sm font-bold hover:border-brand"
          >
            전체 이메일 복사
          </button>
        </div>
      </div>

      <p className="mt-4 rounded-2xl bg-stamp-soft px-4 py-3 text-xs leading-relaxed text-ink">
        복사한 이메일은 <b>Play Console → 테스트 → 비공개 테스트 → 테스터 목록</b>에 그대로
        붙여넣으면 됩니다(줄바꿈 구분). 신청자 이메일은 개인정보이므로 이 화면 밖으로 옮길 때
        주의해 주세요.
      </p>

      {copied && <p className="mt-3 text-sm font-bold text-brand">{copied}</p>}

      {rows && rows.length === 0 && (
        <p className="py-20 text-center text-muted">아직 신청이 없습니다.</p>
      )}

      <ul className="mt-6 space-y-3">
        {rows?.map((r) => (
          <li key={r.id} className="rounded-2xl border border-line bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2">
                  <b className="font-extrabold">{r.name}</b>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[r.status]}`}
                  >
                    {BETA_STATUS_LABEL[r.status]}
                  </span>
                </p>
                {/* 선택 복사 편의를 위해 이메일은 그대로 노출 (관리자 화면) */}
                <p className="mt-1 truncate font-mono text-sm text-muted select-all">{r.email}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(r.id, s)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                      r.status === s
                        ? "border-brand bg-brand text-white"
                        : "border-line text-muted hover:text-ink"
                    }`}
                  >
                    {BETA_STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            {(r.device || r.note) && (
              <div className="mt-3 border-t border-line pt-3 text-sm">
                {r.device && (
                  <p className="text-muted">
                    <b className="text-ink">기기</b> {r.device}
                  </p>
                )}
                {r.note && (
                  <p className="mt-1 whitespace-pre-wrap text-muted">
                    <b className="text-ink">메모</b> {r.note}
                  </p>
                )}
              </div>
            )}
            <p className="mt-2 text-xs text-muted">신청 {fmtDate(r.createdAt)}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
