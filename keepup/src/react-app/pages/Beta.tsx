// 베타테스터 모집 · 신청 — Play 비공개 테스트 참여 신청을 받는다.
// 신청은 '구글 계정으로 로그인 → 신청' 흐름. Play Console에 등록할 이메일이 필요하기 때문에
// 구글 계정 이메일이 있는 계정만 신청할 수 있고, 이메일은 관리자만 본다.
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Stamp from "../components/Stamp";
import {
  api,
  fmtDate,
  loginUrl,
  BETA_STATUS_LABEL,
  type BetaMe,
  type Me,
} from "../lib/api";

const BENEFITS = [
  {
    t: "정식 출시 전 기능을 먼저",
    d: "다음 버전에 들어갈 기능을 가장 먼저 써 보고, 마음에 안 드는 점을 바꿀 수 있습니다.",
  },
  {
    t: "의견이 실제로 반영됩니다",
    d: "1인 스튜디오라 의사결정이 짧습니다. 개선사항 게시판에 올린 제안이 다음 업데이트에 그대로 들어갑니다.",
  },
  {
    t: "테스터 표시",
    d: "성과 게시판에서 초기 테스터로 함께 이름을 남깁니다.",
  },
];

const STEPS = [
  { n: "01", t: "구글 계정으로 로그인", d: "Play 테스터 등록에는 구글 계정 이메일이 필요합니다." },
  { n: "02", t: "이 페이지에서 신청", d: "쓰는 기기와 하고 싶은 말을 적어 주세요. 30초면 됩니다." },
  { n: "03", t: "승인 후 초대 링크", d: "승인되면 등록한 구글 계정으로 비공개 테스트에 참여할 수 있습니다." },
];

export default function Beta({
  me,
  mainUrl,
  logout,
}: {
  me: Me;
  mainUrl: string;
  logout: () => Promise<void>;
}) {
  const [state, setState] = useState<BetaMe | null>(null);
  const [device, setDevice] = useState("");
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false); // 개인정보 수집·이용 동의 (필수)
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await api<BetaMe>("/api/beta/me");
    if (res.ok) setState(res.data);
  }, []);

  useEffect(() => {
    void load();
  }, [load, me]);

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await api("/api/beta/apply", {
      method: "POST",
      body: JSON.stringify({ device: device.trim(), note: note.trim(), agreed: agree }),
    });
    setBusy(false);
    if (res.ok) {
      setDevice("");
      setNote("");
      setAgree(false);
      void load();
    } else {
      setError(
        res.error === "consent_required"
          ? "개인정보 수집·이용에 동의해야 신청할 수 있습니다."
          : res.error === "email_required"
            ? "구글 계정으로 로그인해야 신청할 수 있습니다."
            : res.error === "already_applied"
              ? "이미 신청하셨습니다."
              : "신청에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  };

  const cancel = async () => {
    if (!confirm("신청을 취소할까요?")) return;
    setBusy(true);
    await api("/api/beta/apply", { method: "DELETE" });
    setBusy(false);
    void load();
  };

  const applied = state?.application ?? null;

  return (
    <main>
      {/* 히어로 */}
      <section className="relative isolate overflow-hidden bg-night text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <div className="animate-pulse-glow absolute -top-28 left-1/3 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-stamp/25 blur-[110px]" />
          <div
            className="animate-pulse-glow absolute -bottom-32 right-0 h-[22rem] w-[22rem] rounded-full bg-neon/15 blur-[110px]"
            style={{ animationDelay: "1.8s" }}
          />
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-14 pt-16 text-center">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-stamp-accent">BETA TESTER</p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            베타테스터를 <span className="text-stamp-accent">모집합니다</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/65">
            다음 버전을 먼저 써 보고, 고쳐야 할 점을 알려 주실 분을 찾습니다. 구글 계정으로
            로그인하고 신청하면 됩니다.
          </p>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-stamp/60 to-transparent" />
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        {me?.role === "admin" && (
          <Link
            to="/beta/manage"
            className="mb-6 inline-block rounded-xl border border-stamp/40 bg-stamp-soft px-4 py-2 text-xs font-bold text-stamp hover:border-stamp"
          >
            신청 관리 (관리자) →
          </Link>
        )}

        {/* 신청 상태 / 신청 폼 */}
        <div className="rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
          {!me ? (
            <div className="text-center">
              <div className="mb-5 flex justify-center">
                <Stamp size={64} />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">
                구글 계정으로 로그인하고 신청하세요
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                Play 비공개 테스트는 <b className="text-ink">구글 계정 이메일</b>을 등록해야 참여가
                됩니다. 로그인하면 그 이메일로 바로 신청됩니다.
              </p>
              <a
                href={loginUrl(mainUrl, `${window.location.origin}/beta`)}
                className="mt-7 inline-block rounded-2xl bg-brand px-6 py-3.5 text-sm font-bold text-white hover:bg-brand-deep"
              >
                구글 계정으로 로그인
              </a>
            </div>
          ) : applied ? (
            <div className="text-center">
              <div className="mb-5 flex justify-center">
                <Stamp size={64} level={applied.status === "approved" ? 2 : 1} check={applied.status === "approved"} />
              </div>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                  applied.status === "approved"
                    ? "bg-success/15 text-success"
                    : applied.status === "rejected"
                      ? "bg-muted/15 text-muted"
                      : "bg-stamp/12 text-stamp"
                }`}
              >
                {BETA_STATUS_LABEL[applied.status]}
              </span>
              <h2 className="mt-4 text-xl font-extrabold tracking-tight">
                {applied.status === "approved"
                  ? "베타테스터로 참여 중입니다"
                  : applied.status === "rejected"
                    ? "이번 회차는 보류되었습니다"
                    : "신청이 접수되었습니다"}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                {applied.status === "approved" ? (
                  <>
                    등록한 구글 계정으로 Play 비공개 테스트에 참여할 수 있습니다. 써 보시고{" "}
                    <Link to="/feedback" className="font-bold text-brand hover:underline">
                      개선사항 게시판
                    </Link>
                    에 의견을 남겨 주세요.
                  </>
                ) : applied.status === "rejected" ? (
                  "다음 회차에 다시 모집합니다. 그때 또 신청해 주세요."
                ) : (
                  "확인 후 승인해 드립니다. 승인되면 이 페이지에서 상태가 바뀝니다."
                )}
              </p>
              <p className="mt-4 text-xs text-muted">
                신청일 {fmtDate(applied.createdAt)}
                {applied.device ? ` · ${applied.device}` : ""}
              </p>
              {applied.status !== "approved" && (
                <button
                  onClick={cancel}
                  disabled={busy}
                  className="mt-5 text-xs text-muted underline hover:text-stamp disabled:opacity-50"
                >
                  신청 취소
                </button>
              )}
            </div>
          ) : state && !state.canApply ? (
            <div className="text-center">
              <h2 className="text-xl font-extrabold tracking-tight">구글 계정이 필요합니다</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                지금 로그인한 계정에는 이메일 정보가 없습니다. Play 테스터 등록에는 구글 계정
                이메일이 필요하니, <b className="text-ink">구글로 다시 로그인</b>한 뒤 신청해 주세요.
              </p>
              <a
                href={loginUrl(mainUrl, `${window.location.origin}/beta`)}
                className="mt-6 inline-block rounded-2xl border border-line px-6 py-3 text-sm font-bold hover:border-brand"
              >
                구글 계정으로 다시 로그인
              </a>
            </div>
          ) : (
            <form onSubmit={apply}>
              <h2 className="text-xl font-extrabold tracking-tight">베타테스터 신청</h2>
              <p className="mt-2 text-sm text-muted">
                아래 계정으로 Play 비공개 테스트에 등록됩니다.
              </p>

              {/* 구글 계정을 여러 개 쓰는 사람이 대부분이라, 신청 직전에 계정을 못 박아 확인시킨다.
                  여기서 틀리면 승인돼도 테스트 버전이 보이지 않아 문의가 몰린다. */}
              <div className="mt-3 rounded-2xl border-2 border-stamp/35 bg-stamp-soft p-4">
                <p className="text-xs font-extrabold text-stamp">
                  이 계정이 폰 플레이스토어 계정과 같은지 확인해 주세요
                </p>
                <p className="mt-2 rounded-xl bg-card px-4 py-3 text-sm font-bold break-all">
                  {state?.email ?? "—"}
                </p>
                <p className="mt-2.5 text-xs leading-relaxed text-ink/70">
                  구글 계정을 여러 개 쓰시는 경우가 많습니다.{" "}
                  <b>폰에서 앱을 받는 계정과 다르면 승인되어도 테스트 버전이 보이지 않습니다.</b>{" "}
                  <a href="#check-account" className="font-bold underline">
                    확인하는 방법 ↓
                  </a>
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm("로그아웃 후 다른 구글 계정으로 다시 로그인할까요?")) return;
                    await logout();
                    window.location.href = loginUrl(mainUrl, `${window.location.origin}/beta`);
                  }}
                  className="mt-3 rounded-xl border border-stamp/40 bg-card px-3.5 py-2 text-xs font-bold text-stamp hover:border-stamp"
                >
                  다른 구글 계정으로 신청하기
                </button>
              </div>

              <label className="mt-6 block text-sm font-bold">
                쓰는 기기 <span className="font-normal text-muted">(선택)</span>
                <input
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  maxLength={60}
                  placeholder="예: Galaxy S24 · Android 15"
                  className="mt-2 w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-normal focus:border-brand focus:outline-none"
                />
              </label>

              <label className="mt-4 block text-sm font-bold">
                하고 싶은 말 <span className="font-normal text-muted">(선택)</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="어떤 습관을 기록하고 싶은지, 어떤 점이 궁금한지 적어 주세요."
                  className="mt-2 w-full resize-y rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-normal focus:border-brand focus:outline-none"
                />
              </label>

              {/* 개인정보 수집·이용 동의 (필수) — 신청 시점의 명시적 동의.
                  수집 항목·목적·보유기간을 여기서 다 보여주고, 서버도 동의 없이는 400으로 막는다. */}
              <label className="mt-6 flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-paper px-4 py-3">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => {
                    setAgree(e.target.checked);
                    if (e.target.checked) setError(null);
                  }}
                  className="mt-0.5 h-4 w-4 accent-brand"
                />
                <span className="text-xs leading-relaxed text-muted">
                  <b className="text-ink">[필수]</b> 베타테스터 등록을 위한 개인정보 수집·이용에
                  동의합니다.
                  <br />
                  <b className="text-ink">수집 항목</b> 구글 계정 이메일, (입력 시) 기기 정보·메모 ·{" "}
                  <b className="text-ink">목적</b> Google Play 비공개 테스트 테스터 등록 및 안내 ·{" "}
                  <b className="text-ink">보유 기간</b> 신청 취소 시 즉시 삭제, 테스트 종료 시 파기
                  <br />
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-ink"
                  >
                    개인정보처리방침 보기
                  </a>
                  {" · "}
                  <a href="/terms" target="_blank" rel="noreferrer" className="underline hover:text-ink">
                    베타 테스트 약관 보기
                  </a>
                </span>
              </label>
              <p className="mt-2 text-xs text-muted">
                동의하지 않아도 앱은 그대로 쓸 수 있습니다. 베타 테스트 참여만 제한됩니다.
              </p>

              {error && <p className="mt-4 text-sm font-semibold text-stamp">{error}</p>}

              <button
                disabled={busy || !agree}
                className="mt-6 w-full rounded-2xl bg-brand px-6 py-3.5 text-sm font-bold text-white hover:bg-brand-deep disabled:opacity-50 sm:w-auto"
              >
                {busy ? "신청 중…" : "신청하기"}
              </button>
            </form>
          )}
        </div>

        {/* 참여 방법 */}
        <h2 className="mt-16 text-center text-2xl font-extrabold tracking-tight">참여 방법</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-line bg-card p-5">
              <p className="text-xs font-black text-stamp">{s.n}</p>
              <h3 className="mt-2 font-extrabold tracking-tight">{s.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.d}</p>
            </div>
          ))}
        </div>

        {/* 내 구글 계정 확인 — 신청 계정과 Play 스토어 계정이 다르면 테스트 버전이 보이지 않는다.
            실제로 가장 많이 막히는 지점이라 따로 안내한다. */}
        <div
          id="check-account"
          className="mt-14 scroll-mt-20 rounded-3xl border-2 border-stamp/30 bg-stamp-soft p-6 sm:p-8"
        >
          <h2 className="text-xl font-extrabold tracking-tight">
            내 구글 계정(플레이스토어 계정) 확인하는 방법
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/75">
            구글 계정은 보통 여러 개 있습니다. 회사 계정, 예전에 쓰던 계정, 가족 계정까지 섞여
            있기 마련이죠. <b>신청한 계정</b>과 <b>폰 플레이스토어에 로그인된 계정</b>이 같아야
            테스트 버전이 보이니, 아래에서 먼저 확인해 주세요.
          </p>

          <ol className="mt-5 space-y-3 text-sm">
            {[
              {
                t: "플레이스토어 앱을 엽니다",
                d: "폰에서 Play 스토어(▶ 아이콘)를 실행하세요.",
              },
              {
                t: "오른쪽 위 프로필 사진을 누릅니다",
                d: "검색창 오른쪽 끝의 동그란 프로필 사진(또는 이니셜)입니다.",
              },
              {
                t: "맨 위에 보이는 이메일이 내 계정입니다",
                d: "예: hong@gmail.com — 이 이메일로 신청해야 합니다.",
              },
              {
                t: "계정이 여러 개면 앱을 설치할 계정으로 바꿔 주세요",
                d: "이메일 옆 화살표(∨)를 누르면 계정 목록이 나옵니다. 여기서 고른 계정이 앱을 받는 계정입니다.",
              },
            ].map((s, i) => (
              <li key={s.t} className="flex gap-3">
                <span
                  className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-stamp text-[11px] font-black text-white"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span>
                  <b className="block font-extrabold">{s.t}</b>
                  <span className="mt-0.5 block leading-relaxed text-ink/70">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-2xl bg-card px-4 py-3.5 text-sm">
            <p className="font-extrabold text-stamp">이것만 기억하세요</p>
            <p className="mt-1.5 leading-relaxed text-muted">
              이 사이트에 <b className="text-ink">구글로 로그인한 계정</b> = 신청되는 계정입니다.
              그 계정이 폰 플레이스토어 계정과 다르면, 승인돼도 테스트 버전이 보이지 않습니다.
              {state?.email && (
                <>
                  {" "}
                  지금 로그인한 계정은 <b className="text-ink">{state.email}</b> 입니다.
                </>
              )}
            </p>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-ink/60">
            아이폰은 Play 스토어가 없어 비공개 테스트에 참여할 수 없습니다. 대신{" "}
            <a href="/app/" className="font-bold underline">
              웹앱
            </a>
            을 설치 없이 바로 쓰실 수 있습니다(마감 알림은 안드로이드 앱에서만 울립니다).
          </p>
        </div>

        {/* 혜택 */}
        <h2 className="mt-16 text-center text-2xl font-extrabold tracking-tight">
          테스터가 되면
        </h2>
        <div className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.t}>
              <h3 className="flex items-center gap-2 font-extrabold tracking-tight">
                <span className="h-1.5 w-1.5 rounded-full bg-stamp" aria-hidden />
                {b.t}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{b.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-brand px-8 py-10 text-center text-white">
          <h2 className="text-xl font-extrabold tracking-tight">이미 쓰고 계신가요?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/85">
            테스터가 아니어도 개선 의견은 언제든 받습니다. 불편한 점을 알려 주세요.
          </p>
          <Link
            to="/feedback"
            className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 text-sm font-bold text-brand hover:bg-white/90"
          >
            개선사항 게시판으로 →
          </Link>
        </div>
      </section>
    </main>
  );
}
