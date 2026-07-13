/** KeepUp 시그니처 — 인주색 도장 마크 */
export default function Stamp({
  size = 64,
  label = "KEEP\nUP!",
  className = "",
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  const lines = label.split("\n");
  return (
    <span
      className={`grid shrink-0 rotate-[-8deg] place-items-center rounded-full border-4 border-stamp text-stamp ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="text-center font-extrabold leading-tight tracking-tight"
        style={{ fontSize: size * 0.19 }}
      >
        {lines.map((l, i) => (
          <span key={i} className="block">
            {l}
          </span>
        ))}
      </span>
    </span>
  );
}
