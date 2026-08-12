/** Log Challenge 도장 — 앱 StampMark(lib/theme.dart)와 같은 구성.
 *  레벨별 바브바브 얼굴을 그라데이션 링이 감싸고, 손으로 찍은 듯 -8도 기울어 있다.
 *  도장을 모을수록 캐릭터가 성장한다: 1 후드 바브 · 2 탐구 바브 · 3 마스터 바브.
 *  (label prop은 이전 텍스트 도장과의 호환용이며 표시하지 않는다 — 앱도 동일) */
const FACE: Record<number, string> = {
  1: "/vave/face.webp",
  2: "/vave/face2.webp",
  3: "/vave/face3.webp",
};

/** 레벨별 링 색 — 앱 AppTheme.stampRingColors */
const RING: Record<number, [string, string]> = {
  1: ["#7c5cff", "#7c5cff"],
  2: ["#7c5cff", "#37b4ff"],
  3: ["#ffc24d", "#ff8a3d"],
};

export default function Stamp({
  size = 64,
  level = 1,
  check = false,
  className = "",
}: {
  size?: number;
  /** 이전 텍스트 도장 호환용 — 표시되지 않는다 */
  label?: string;
  level?: 1 | 2 | 3;
  /** 완료 체크 배지를 함께 찍는다 */
  check?: boolean;
  className?: string;
}) {
  const [from, to] = RING[level] ?? RING[1];
  const ringWidth = Math.max(2, size * 0.075);

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="grid h-full w-full place-items-center rounded-full"
        style={{
          padding: ringWidth,
          background: `linear-gradient(135deg, ${from}, ${to})`,
          boxShadow: `0 ${size * 0.05}px ${size * (level >= 3 ? 0.3 : 0.18)}px ${
            level >= 3 ? "rgba(255,138,61,.45)" : "rgba(124,92,255,.22)"
          }`,
          transform: "rotate(-8deg)",
        }}
      >
        <span className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-stamp-soft">
          <img src={FACE[level] ?? FACE[1]} alt="" className="h-full w-full object-cover" />
        </span>
      </span>

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
