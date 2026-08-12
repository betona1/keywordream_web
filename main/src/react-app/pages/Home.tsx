// 브랜드 메인 랜딩 — 바브바브 다크 히어로 + 레벨 도감 + 로그챌린지 제품 카드
import { useEffect, useState } from "react";

/** 마스코트 바브바브(VAVEVAVE) 성장 단계 — 이미지 3장이 곧 Lv.1~3 도감 */
const LEVELS = [
  {
    lv: 1,
    name: "호기심 바브",
    en: "Curious VAVEVAVE",
    desc: "세상 모든 게 궁금한 단계. 아직 답은 모르지만, 물음표를 던지는 법부터 배웁니다.",
    traits: ["호기심", "관찰", "질문"],
    char: "/vave/lv1.webp",
    card: "/vave/card1.webp",
  },
  {
    lv: 2,
    name: "탐구 바브",
    en: "Explorer VAVEVAVE",
    desc: "호기심이 커지고, 스스로 정보를 찾고 연결하기 시작해요. 좋은 질문을 만들기 위해 세상을 탐구하는 단계!",
    traits: ["탐구", "연결", "이해", "질문"],
    char: "/vave/lv2.webp",
    card: "/vave/card2.webp",
  },
  {
    lv: 3,
    name: "질문 마스터 바브",
    en: "Question Master VAVEVAVE",
    desc: "질문을 구조화하고, 핵심을 꿰뚫어 컨텍스트를 이해해요. 더 좋은 질문으로 더 깊은 답을 찾아냅니다.",
    traits: ["통찰", "컨텍스트", "AI 협업", "성장"],
    char: "/vave/lv3.webp",
    card: "/vave/card3.webp",
  },
] as const;

/** 다크 섹션 배경 — 네온 글로우 2개 + 그리드 + 반짝이는 파티클(좌표 고정) */
const SPARKS = [
  { x: 12, y: 22, s: 3, d: 0 },
  { x: 27, y: 68, s: 2, d: 0.7 },
  { x: 41, y: 14, s: 2, d: 1.4 },
  { x: 58, y: 80, s: 3, d: 0.3 },
  { x: 71, y: 31, s: 2, d: 1.9 },
  { x: 84, y: 62, s: 3, d: 1.1 },
  { x: 93, y: 18, s: 2, d: 2.4 },
  { x: 8, y: 84, s: 2, d: 1.6 },
];

function NightBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* 네온 글로우 */}
      <div className="animate-pulse-glow absolute -top-32 left-1/2 h-[34rem] w-[34rem] -translate-x-1/3 rounded-full bg-neon/20 blur-[110px]" />
      <div
        className="animate-pulse-glow absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-neon-2/12 blur-[110px]"
        style={{ animationDelay: "1.8s" }}
      />
      {/* 미세 그리드 */}
      <div
        className="absolute inset-0 opacity-[0.18] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_72%)]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(125,227,255,.28) 1px, transparent 1px), linear-gradient(90deg, rgba(125,227,255,.28) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* 파티클 */}
      {SPARKS.map((p, i) => (
        <span
          key={i}
          className="animate-twinkle absolute rounded-full bg-neon-2 shadow-[0_0_10px_2px_rgba(125,227,255,.7)]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s,
            height: p.s,
            animationDelay: `${p.d}s`,
          }}
        />
      ))}
    </div>
  );
}

/** 도감 원본 카드 확대 보기 */
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-night-2/92 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-[88vh] w-auto max-w-full rounded-2xl shadow-[0_0_80px_-10px_rgba(77,163,255,.5)]"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="mt-5 rounded-full border border-white/20 px-5 py-2 text-sm font-bold text-white/80 hover:border-neon hover:text-white"
      >
        닫기 (Esc)
      </button>
    </div>
  );
}

export default function Home() {
  const [zoom, setZoom] = useState<(typeof LEVELS)[number] | null>(null);

  return (
    <main>
      {/* ── 히어로 (다크) ───────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-night text-white">
        <NightBackdrop />
        {/* pt에 헤더 높이(3.5rem)를 포함한다 — 헤더가 -mb-14로 히어로 위에 겹쳐 있다 */}
        <div className="mx-auto grid max-w-6xl items-center gap-4 px-4 pb-16 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-34">
          <div className="text-center lg:text-left">
            <p className="mb-5 inline-block rounded-full border border-neon/35 bg-neon/10 px-3.5 py-1.5 text-xs font-semibold tracking-tight text-neon-2">
              keyword + dream = keywordream
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              꾸준함을 만드는
              <br />
              <span className="bg-gradient-to-r from-neon-2 via-neon to-neon-2 bg-clip-text text-transparent">
                작은 도구
              </span>
              를 만듭니다
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/65 lg:mx-0">
              키워드림은 좋은 습관을 <b className="font-bold text-white">키워, 드림</b>하는 1인
              스튜디오입니다. 매일 열게 되는 작고 단단한 앱으로, 미루면 사라지는 결심을 붙잡습니다.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <a
                href="https://log.keywordream.com"
                className="rounded-2xl bg-gradient-to-r from-neon to-neon-2 px-6 py-3.5 text-sm font-bold text-night shadow-[0_0_32px_-6px_rgba(77,163,255,.75)] transition hover:brightness-110"
              >
                로그챌린지 만나보기 →
              </a>
              <a
                href="#vavevave"
                className="rounded-2xl border border-white/20 px-6 py-3.5 text-sm font-bold text-white/85 transition hover:border-neon hover:text-white"
              >
                바브바브 도감 보기
              </a>
            </div>
          </div>

          {/* 마스코트 */}
          <div className="relative mx-auto w-full max-w-[290px] sm:max-w-[380px] lg:max-w-[440px]">
            <div
              className="animate-pulse-glow absolute inset-x-6 top-10 bottom-14 rounded-full bg-neon/25 blur-[70px]"
              aria-hidden
            />
            <img
              src="/vave/hero.webp"
              alt="키워드림 마스코트 바브바브 — 물음표 홀로그램을 든 아기 원숭이"
              width={900}
              height={1193}
              className="animate-float relative block w-full [mask-image:radial-gradient(ellipse_at_center,black_52%,transparent_80%)]"
              fetchPriority="high"
            />
            <p className="relative -mt-4 text-center text-xs font-semibold tracking-tight text-white/45">
              마스코트 <b className="text-neon-2">바브바브</b> · VAVEVAVE
            </p>
          </div>
        </div>
      </section>

      {/* ── 바브바브 도감 (다크) ────────────────────────────────── */}
      <section id="vavevave" className="relative isolate overflow-hidden bg-night-2 text-white">
        <NightBackdrop />
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center">
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-neon">VAVEVAVE ARCHIVE</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              질문이 자라면, 바브바브도 자랍니다
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60">
              키워드림의 마스코트 바브바브는 좋은 질문을 던질수록 성장합니다. 호기심에서 시작해
              탐구를 거쳐 질문 마스터가 되기까지 — 습관도 꼭 이렇게 자랍니다.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LEVELS.map((l) => (
              <button
                key={l.lv}
                onClick={() => setZoom(l)}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] text-left transition duration-300 hover:-translate-y-1.5 hover:border-neon/50 hover:shadow-[0_24px_60px_-24px_rgba(77,163,255,.55)]"
              >
                <div className="relative aspect-4/5 overflow-hidden">
                  {/* 일러스트마다 배경 딥네이비 값이 미세하게 달라, 가장자리를 마스크로 날려 카드 배경에 녹인다 */}
                  <img
                    src={l.char}
                    alt={`Level ${l.lv} ${l.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.06] [mask-image:radial-gradient(ellipse_112%_104%_at_50%_38%,black_58%,transparent_92%)]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-night-2 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full border border-neon/45 bg-night-2/70 px-3 py-1 text-[11px] font-bold tracking-tight text-neon-2 backdrop-blur">
                    Level {l.lv}
                  </span>
                </div>
                <div className="relative -mt-6 px-6 pb-6">
                  <h3 className="text-xl font-extrabold tracking-tight">{l.name}</h3>
                  <p className="mt-0.5 text-xs font-bold tracking-tight text-neon">{l.en}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{l.desc}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {l.traits.map((t) => (
                      <li
                        key={t}
                        className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-white/70"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-sm font-bold text-neon-2/70 transition group-hover:text-neon-2">
                    도감 원본 보기 →
                  </p>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-white/35">
            카드를 누르면 도감 원본을 크게 볼 수 있어요.
          </p>
        </div>
        {/* 다크 존의 끝 — 딥네이비에서 페이퍼로 그라디언트를 태우면 탁한 회색이 뜬다.
            네온 라인 한 줄로 딱 끊는 편이 선명하다. */}
        <div className="h-px bg-gradient-to-r from-transparent via-neon/55 to-transparent" />
      </section>

      {/* ── 제품: 로그챌린지 (라이트) ───────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pb-24 pt-20">
        <a
          href="https://log.keywordream.com"
          className="group block rounded-3xl border border-line bg-card p-8 shadow-sm transition hover:border-brand hover:shadow-lg sm:p-12"
        >
          <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
            {/* 도장 시그니처 — 앱 StampMark와 같은 구성(바브바브 얼굴 + 그라데이션 링, -8도 기울기) */}
            <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-2xl bg-brand/10">
              <span
                className="grid h-20 w-20 place-items-center rounded-full p-1.5 transition group-hover:rotate-[-2deg]"
                style={{
                  background: "linear-gradient(135deg, #7c5cff, #37b4ff)",
                  boxShadow: "0 4px 14px rgba(124,92,255,.28)",
                  transform: "rotate(-8deg)",
                }}
                aria-hidden
              >
                <span className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-stamp-soft">
                  <img src="/vave/face.webp" alt="" className="h-full w-full object-cover" />
                </span>
              </span>
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-2xl font-extrabold tracking-tight">로그챌린지</h2>
                <span className="rounded-full bg-stamp/10 px-2.5 py-0.5 text-xs font-bold text-stamp">
                  Google Play 출시
                </span>
              </div>
              <p className="text-muted">
                습관을 사진으로 인증하면 도장이 찍히고, 마감 3시간 전 알림이 놓치지 않게 붙잡아 주는
                습관 인증 앱. 63일 뒤엔 도장으로 가득 찬 기록만 남습니다.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-muted">
                {["사진 인증 + 날짜 워터마크", "마감 3시간 전 알림", "적립형·결과형 루틴", "성과 자랑 게시판"].map(
                  (f) => (
                    <li key={f} className="rounded-full border border-line bg-paper px-3 py-1">
                      {f}
                    </li>
                  ),
                )}
              </ul>
              <p className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand group-hover:underline">
                로그챌린지 자세히 보기 →
              </p>
            </div>
          </div>
        </a>
      </section>

      {/* ── 철학 (라이트) ───────────────────────────────────────── */}
      <section className="border-t border-line bg-card">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-16 sm:grid-cols-3">
          {[
            {
              t: "혼자 써도 완결",
              d: "계정 없이, 서버 없이. 앱은 폰 안에서 끝나는 자기만족용 도구여야 합니다.",
            },
            {
              t: "기록이 곧 보상",
              d: "화려한 게이미피케이션 대신, 도장으로 가득 찬 63일의 기록이 남습니다.",
            },
            {
              t: "자랑은 선택",
              d: "완주했다면 자랑할 자격이 있습니다. 성과 게시판에서 서로의 도장을 찍어 줍니다.",
            },
          ].map((v) => (
            <div key={v.t}>
              <h3 className="mb-2 font-extrabold">{v.t}</h3>
              <p className="text-sm leading-relaxed text-muted">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {zoom && (
        <Lightbox
          src={zoom.card}
          alt={`바브바브 Level ${zoom.lv} ${zoom.name} 도감`}
          onClose={() => setZoom(null)}
        />
      )}
    </main>
  );
}
