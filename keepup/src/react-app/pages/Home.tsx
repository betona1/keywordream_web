// KeepUp 홍보 홈 — 앱 소개 + 다운로드(출시 예정) + 도장 시그니처
import { Link } from "react-router-dom";
import Stamp from "../components/Stamp";

const FEATURES = [
  {
    t: "사진으로 인증",
    d: "습관을 실행하고 사진 한 장. 날짜·시각 워터마크가 자동으로 찍혀 조작 걱정이 없습니다.",
    icon: "📷",
  },
  {
    t: "마감 3시간 전 알림",
    d: "미루면 사라지는 결심을 마감 3시간·1시간·30분 전 알림이 붙잡아 줍니다. 인증하면 그날 알림은 자동 취소.",
    icon: "⏰",
  },
  {
    t: "적립형 · 결과형 루틴",
    d: "매일 쌓는 적립형, 목표를 선언하고 주 단위로 인증하는 결과형. 나에게 맞는 방식으로.",
    icon: "🗂️",
  },
  {
    t: "도장으로 남는 기록",
    d: "인증할 때마다 도장이 찍힙니다. 63일 뒤엔 도장으로 가득 찬 나만의 기록이 남습니다.",
    icon: "🔴",
  },
  {
    t: "카톡으로 공유",
    d: "인증 직후 OS 공유 시트로 오픈채팅방에 바로 전송. 챌린지 모임 인증도 한 번에.",
    icon: "💬",
  },
  {
    t: "성과 자랑 게시판",
    d: "완주했다면 자랑할 자격이 있습니다. 63일의 기록을 게시판에 올리고 서로의 도장을 받아 보세요.",
    icon: "🏅",
  },
];

export default function Home() {
  return (
    <main>
      {/* 히어로 */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-20 text-center">
        <div className="mb-6 flex justify-center">
          <Stamp size={96} />
        </div>
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          습관을 <span className="text-stamp">도장</span>으로 남기다
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted">
          사진으로 인증하면 도장이 찍히고, 마감 3시간 전 알림이 놓치지 않게 붙잡아 주는
          습관 인증 앱. <b className="text-ink">63일 뒤엔 도장으로 가득 찬 기록만 남습니다.</b>
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span
            className="cursor-default rounded-2xl bg-ink px-6 py-3.5 text-sm font-bold text-white opacity-80"
            title="Google Play 출시 준비 중"
          >
            ▶ Google Play — 출시 준비 중
          </span>
          <Link
            to="/stories"
            className="rounded-2xl border border-line bg-card px-6 py-3.5 text-sm font-bold hover:border-brand"
          >
            성과 게시판 구경하기 →
          </Link>
        </div>
        <p className="mt-3 text-xs text-muted">iOS는 안드로이드 출시 후 준비합니다.</p>
      </section>

      {/* 기능 */}
      <section className="border-t border-line bg-card">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-center text-2xl font-extrabold tracking-tight">
            미루면 사라지는 결심을 붙잡는 법
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.t} className="rounded-2xl border border-line bg-paper p-6">
                <span className="text-2xl" aria-hidden>
                  {f.icon}
                </span>
                <h3 className="mt-3 font-extrabold">{f.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 63일 규칙 */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="rounded-3xl bg-brand px-8 py-12 text-center text-white sm:px-16">
          <h2 className="text-2xl font-extrabold tracking-tight">왜 63일일까요?</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/85">
            습관이 몸에 붙는 데 평균 66일이 걸린다는 연구가 있습니다. KeepUp은 9주,
            63일을 한 시즌으로 봅니다. 하루하루의 도장이 모여 시즌이 끝나면 —
            그 기록이 곧 다음 시즌을 시작할 이유가 됩니다.
          </p>
          <Link
            to="/stories"
            className="mt-7 inline-block rounded-2xl bg-white px-6 py-3 text-sm font-bold text-brand hover:bg-white/90"
          >
            완주자들의 기록 보기
          </Link>
        </div>
      </section>
    </main>
  );
}
