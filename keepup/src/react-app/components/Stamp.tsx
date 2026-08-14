/** Log Challenge 도장 — 앱 StampMark(lib/theme.dart)와 같은 구성.
 *  레벨별 바브바브 얼굴을 그라데이션 링이 감싸고, 손으로 찍은 듯 -8도 기울어 있다.
 *  도장을 모을수록 캐릭터가 성장한다:
 *  1 후드 바브 · 2 탐구 바브 · 3 마스터 바브 · 4 초사이언 바브 · 5 코스믹 마스터 바브.
 *  4단계부터 링이 화려해지고, 5단계는 오로라 링이 천천히 돌며 별이 반짝인다.
 *  (label prop은 이전 텍스트 도장과의 호환용이며 표시하지 않는다 — 앱도 동일) */
const FACE: Record<number, string> = {
  1: "/vave/face.webp",
  2: "/vave/face2.webp",
  3: "/vave/face3.webp",
  4: "/vave/face4.webp",
  5: "/vave/face5.webp",
};

/** 레벨별 링 색 — 앱 AppTheme.stampRingColors */
const RING: Record<number, string[]> = {
  1: ["#7c5cff", "#7c5cff"],
  2: ["#7c5cff", "#37b4ff"],
  3: ["#ffc24d", "#ff8a3d"],
  // 4단계 초사이언 — 백금빛에서 타오르는 골드로
  4: ["#fff3b0", "#ffc24d", "#ff6d00"],
  // 5단계 코스믹 — 오로라 (conic으로 한 바퀴 돌아 처음 색으로 이어진다)
  5: ["#7c5cff", "#37b4ff", "#80e8ff", "#b388ff", "#7c5cff"],
};

/** 레벨별 글로우 — 위로 갈수록 강해지고, 5단계는 보라·하늘 이중 광채 */
const GLOW: Record<number, (s: number) => string> = {
  1: (s) => `0 ${s * 0.05}px ${s * 0.18}px rgba(124,92,255,.22)`,
  2: (s) => `0 ${s * 0.05}px ${s * 0.18}px rgba(124,92,255,.22)`,
  3: (s) => `0 ${s * 0.05}px ${s * 0.3}px rgba(255,138,61,.45)`,
  4: (s) => `0 ${s * 0.05}px ${s * 0.36}px rgba(255,179,0,.55)`,
  5: (s) =>
    `0 0 ${s * 0.4}px rgba(124,92,255,.55), 0 0 ${s * 0.2}px rgba(128,232,255,.45)`,
};

/** 5단계 반짝이 — 링 주변에 뜨는 작은 별 (위치·크기·박자를 조금씩 다르게) */
const SPARKS: { top: string; left: string; scale: number; delay: string }[] = [
  { top: "-6%", left: "72%", scale: 1, delay: "0s" },
  { top: "62%", left: "-8%", scale: 0.7, delay: "0.6s" },
  { top: "88%", left: "78%", scale: 0.55, delay: "1.1s" },
];

export default function Stamp({
  size = 64,
  level = 1,
  check = false,
  className = "",
}: {
  size?: number;
  /** 이전 텍스트 도장 호환용 — 표시되지 않는다 */
  label?: string;
  level?: 1 | 2 | 3 | 4 | 5;
  /** 완료 체크 배지를 함께 찍는다 */
  check?: boolean;
  className?: string;
}) {
  const colors = RING[level] ?? RING[1];
  const ringWidth = Math.max(2, size * 0.075);
  const cosmic = level >= 5;
  const ring = cosmic
    ? `conic-gradient(from 0deg, ${colors.join(", ")})`
    : `linear-gradient(135deg, ${colors.join(", ")})`;

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="relative h-full w-full rounded-full"
        style={{ boxShadow: (GLOW[level] ?? GLOW[1])(size), transform: "rotate(-8deg)" }}
      >
        {/* 링 레이어 — 5단계 오로라는 천천히 돈다 (얼굴은 위 레이어라 함께 돌지 않는다) */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: ring,
            animation: cosmic ? "vave-aurora-spin 7s linear infinite" : undefined,
          }}
        />
        <span
          className="absolute grid place-items-center overflow-hidden rounded-full bg-stamp-soft"
          style={{ inset: ringWidth }}
        >
          <img src={FACE[level] ?? FACE[1]} alt="" className="h-full w-full object-cover" />
        </span>
      </span>

      {/* 5단계 — 별이 반짝인다 */}
      {cosmic &&
        SPARKS.map((sp, i) => (
          <span
            key={i}
            className="pointer-events-none absolute font-black"
            style={{
              top: sp.top,
              left: sp.left,
              fontSize: size * 0.22 * sp.scale,
              color: "#bfeaff",
              textShadow: "0 0 6px rgba(128,232,255,.9)",
              animation: `vave-twinkle 1.8s ease-in-out ${sp.delay} infinite`,
            }}
          >
            ✦
          </span>
        ))}

      {check && (
        <span
          className="absolute grid place-items-center rounded-full bg-stamp font-black text-white"
          style={{
            right: -size * 0.06,
            bottom: -size * 0.04,
            width: size * 0.42,
            height: size * 0.42,
            fontSize: size * 0.24,
            border: `${Math.max(1.5, size * 0.04)}px solid var(--color-card)`,
          }}
        >
          ✓
        </span>
      )}
    </span>
  );
}
