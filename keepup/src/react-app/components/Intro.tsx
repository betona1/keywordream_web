// 웹 인트로 — 앱 SplashScreen(lib/screens/splash_screen.dart)을 그대로 옮긴 3초 오프닝.
// 바브바브가 오늘의 습관을 하나씩 해내고 도장이 쾅쾅 찍힌다: 달리기(건강) · 공부하기(자기계발) · 식단관리(다이어트).
// 앱과 같은 화면을 첫 3초에 보여줘서 "이게 그 앱이다"를 알린다. 아무 곳이나 누르면 즉시 건너뛴다.
import { useEffect, useRef } from "react";

const DURATION = 3000;

/** 앱의 _habits 와 동일 — 등장 시점(at)은 전체 진행률 */
const HABITS = [
  { icon: "🏃", title: "달리기", tag: "건강", color: "var(--color-vave-blue)", at: 0.3 },
  { icon: "📖", title: "공부하기", tag: "자기계발", color: "var(--color-vave-violet-soft)", at: 0.44 },
  { icon: "🍽️", title: "식단관리", tag: "다이어트", color: "var(--color-vave-teal)", at: 0.58 },
];

/** 도장은 배지가 뜨고 조금 뒤에 찍힌다 (앱 _stampDelay) */
const STAMP_DELAY = 0.085;

/** 캐릭터 주변 반짝임 — 프레임마다 흔들리지 않게 위치 고정 (앱 _sparkles) */
const SPARKS = [
  { x: -0.72, y: -0.62, s: 5 },
  { x: 0.66, y: -0.7, s: 8 },
  { x: -0.88, y: 0.06, s: 11 },
  { x: 0.9, y: -0.04, s: 5 },
  { x: -0.4, y: 0.52, s: 8 },
  { x: 0.34, y: 0.6, s: 11 },
];

const ms = (progress: number) => `${Math.round(progress * DURATION)}ms`;

export default function Intro({ onDone }: { onDone: () => void }) {
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    onDone();
  };

  useEffect(() => {
    // 모션을 줄이도록 설정한 사용자에겐 인트로를 재생하지 않는다
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    const t = setTimeout(finish, DURATION);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={finish}
      role="button"
      tabIndex={0}
      aria-label="인트로 건너뛰기"
      className="fixed inset-0 z-[70] cursor-pointer overflow-hidden select-none"
      style={{
        background:
          "radial-gradient(120% 95% at 50% 35%, var(--color-vave-navy) 0%, var(--color-vave-navy-deep) 100%)",
        animation: `vave-intro-out 360ms ease-in ${ms(0.88)} forwards`,
      }}
    >
      {/* 배경 네온 글로우 — 캐릭터 뒤에서 서서히 퍼진다 */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] h-[130vmin] w-[130vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(79,169,255,.34) 0%, rgba(124,92,255,.16) 45%, transparent 72%)",
          animation: "vave-glow-in 1350ms ease-out both",
        }}
      />

      <div className="relative flex h-full flex-col items-center justify-center gap-7 px-5">
        {/* ── 캐릭터: 튀어올라 등장 → 계속 통통 ── */}
        <div style={{ animation: `vave-char-in 780ms cubic-bezier(.34,1.4,.64,1) ${ms(0.02)} both` }}>
          <div className="relative" style={{ animation: "vave-hop 620ms ease-in-out 640ms infinite" }}>
            {/* 원본에 딥네이비 배경이 깔려 있어(투명 누끼 아님) 가장자리를 마스크로 날려
                인트로 배경에 녹인다. 안 그러면 글로우와 대비되어 사각형이 드러난다. */}
            <img
              src="/vave/full.webp"
              alt="로그챌린지 마스코트 바브바브"
              width={640}
              height={833}
              className="block h-[38vh] max-h-[360px] w-auto [mask-image:radial-gradient(ellipse_62%_58%_at_50%_46%,black_62%,transparent_92%)]"
              fetchPriority="high"
            />
            {/* 반짝임 — 캐릭터 주변에서 톡톡 터진다 */}
            {SPARKS.map((p, i) => (
              <span
                key={i}
                aria-hidden
                className="absolute rounded-full"
                style={{
                  left: `${50 + p.x * 46}%`,
                  top: `${50 + p.y * 46}%`,
                  width: p.s,
                  height: p.s,
                  background: i % 2 === 0 ? "var(--color-vave-cyan)" : "var(--color-vave-violet-soft)",
                  boxShadow: `0 0 ${p.s * 1.8}px ${p.s * 0.5}px ${
                    i % 2 === 0 ? "rgba(126,211,255,.7)" : "rgba(168,139,255,.7)"
                  }`,
                  animation: `vave-spark 720ms ease-out ${ms(0.24 + i * 0.05)} both`,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── 오늘의 습관 3종 — 하나씩 뜨고 도장이 찍힌다 ── */}
        <div className="flex items-start justify-center gap-2.5">
          {HABITS.map((h) => (
            <div
              key={h.title}
              className="relative"
              style={{ animation: `vave-badge-in 300ms cubic-bezier(.34,1.4,.64,1) ${ms(h.at)} both` }}
            >
              <div
                className="flex w-[86px] flex-col items-center gap-1 rounded-[18px] border py-3 sm:w-[110px]"
                style={{
                  background: "rgba(26,36,54,.92)",
                  borderColor: h.color,
                  boxShadow: `0 0 16px ${h.color}44`,
                }}
              >
                <span className="text-2xl leading-none" aria-hidden>
                  {h.icon}
                </span>
                <span className="text-[12.5px] font-extrabold tracking-tight text-[#e7ecf7]">
                  {h.title}
                </span>
                <span className="text-[10px] font-bold text-[#8da1c2]">{h.tag}</span>
              </div>

              {/* 완료 도장 — 바브바브 얼굴 + 체크 (앱 StampMark) */}
              <span
                aria-hidden
                className="absolute -right-2 -top-2.5 grid h-9 w-9 place-items-center rounded-full border-2"
                style={{
                  borderColor: "var(--color-vave-violet)",
                  background: "var(--color-vave-navy-soft)",
                  animation: `vave-stamp-in 270ms cubic-bezier(.2,.9,.3,1) ${ms(h.at + STAMP_DELAY)} both`,
                }}
              >
                <img src="/vave/face.webp" alt="" className="h-full w-full rounded-full object-cover" />
                <span
                  className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full text-[9px] font-black text-white"
                  style={{ background: "var(--color-vave-violet)" }}
                >
                  ✓
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* ── 워드마크 ── */}
        <div
          className="text-center"
          style={{ animation: `vave-word-in 480ms ease-out ${ms(0.7)} both` }}
        >
          <p className="text-[28px] font-extrabold leading-none tracking-tight">
            <span style={{ color: "var(--color-vave-violet-soft)" }}>Log</span>
            <span style={{ color: "var(--color-vave-blue)" }}>Challenge</span>
          </p>
          <p className="mt-1.5 text-[13px] font-bold text-[#9fb4d8]">오늘도 하나, 도장 쾅!</p>
        </div>
      </div>

      <p className="absolute inset-x-0 bottom-7 text-center text-[11px] font-semibold text-white/35">
        아무 곳이나 눌러 건너뛰기
      </p>
    </div>
  );
}
