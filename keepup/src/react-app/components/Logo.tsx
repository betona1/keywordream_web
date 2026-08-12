/** 로그챌린지 로고 — 앱과 동일한 구성: 바브바브 얼굴을 담은 원형 마크 + LogChallenge 워드마크.
 *  앱 홈 상단(AppBar)의 로고를 그대로 옮긴 것이므로 색·구성을 임의로 바꾸지 않는다. */
export default function Logo({
  size = 30,
  wordmark = true,
  light = false,
}: {
  size?: number;
  wordmark?: boolean;
  light?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-vave-violet bg-vave-navy-soft"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <img src="/vave/face.webp" alt="" className="h-full w-full object-cover" />
      </span>
      {wordmark && (
        <span className="text-lg font-extrabold tracking-tight">
          <span className="text-vave-violet">Log</span>
          <span className={light ? "text-vave-blue" : "text-brand"}>Challenge</span>
        </span>
      )}
    </span>
  );
}
