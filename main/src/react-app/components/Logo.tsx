/** keywordream 로고 — 'K' 도장 마크 + 워드마크 (light: 다크 배경용) */
export default function Logo({
  size = 32,
  wordmark = true,
  light = false,
}: {
  size?: number;
  wordmark?: boolean;
  light?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
        <rect width="64" height="64" rx="14" fill="#4C6EF5" />
        <text
          x="32"
          y="44"
          fontFamily="Arial Black, Arial"
          fontSize="32"
          fontWeight="900"
          fill="white"
          textAnchor="middle"
        >
          K
        </text>
      </svg>
      {wordmark && (
        <span className="text-lg font-extrabold tracking-tight">
          keyword<span className={light ? "text-neon-2" : "text-brand"}>ream</span>
        </span>
      )}
    </span>
  );
}
