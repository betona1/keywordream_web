// Log Challenge 소개 홈 — 앱 v1.2.0 기준. 다크 히어로 + 인증 5종 + 알람 차별점 + 기록/보관 + 지원 범위
import { Link } from "react-router-dom";
import Stamp from "../components/Stamp";
import { PLAY_URL } from "../lib/api";

/** 인증 수단 5종 — 앱 lib/models/routine.dart 의 selectableVerifyMethods 와 일치시킨다 */
const VERIFY_METHODS = [
  {
    icon: "📷",
    t: "사진 인증",
    d: "찍는 순간 날짜·시각이 워터마크로 새겨집니다. 나중에 갤러리에서 골라 붙여도 촬영 시각 그대로 남습니다.",
    for: "만보기 화면 · 책 · 운동 기록 · 집밥",
  },
  {
    icon: "⏱️",
    t: "타이머 인증",
    d: "앱 안에서 시간을 재고, 목표 시간을 넘겨야 도장이 찍힙니다. 사진으로 증명할 수 없는 루틴에 씁니다.",
    for: "명상 15분 · 독서 30분 · 스트레칭",
  },
  {
    icon: "🎙️",
    t: "녹음 인증",
    d: "목소리를 그날의 기록으로 남깁니다. 발음이 어떻게 달라졌는지 처음 녹음과 비교해 들을 수 있습니다.",
    for: "중국어 발음 · 영어 스피킹 · 낭독",
  },
  {
    icon: "🎬",
    t: "동영상 인증",
    d: "자세와 동작이 중요한 루틴은 사진 한 장으로 부족합니다. 짧은 영상으로 그대로 남깁니다.",
    for: "운동 자세 · 홈트 세트 · 악기 연습",
  },
  {
    icon: "🔗",
    t: "URL 인증",
    d: "결과물이 웹에 있다면 링크가 가장 정확한 증거입니다. 주소를 붙여넣으면 그게 그날의 인증입니다.",
    for: "스토어 등록 · 블로그 발행 · 업로드 글",
  },
];

/** 기록을 잃지 않게 하는 장치들 — 대부분 v1.1~1.2에서 추가됐다 */
const KEEPING = [
  {
    t: "회고 카드",
    d: "시즌이 끝나면 통계와 도장 그리드를 한 장의 이미지로 만들어 줍니다. 그대로 공유하면 자랑이 됩니다.",
  },
  {
    t: "갤러리 영구 저장",
    d: "인증 사진 원본을 폰 갤러리에도 함께 저장합니다. 앱을 지워도 워터마크 사진은 남습니다.",
  },
  {
    t: "자동 백업 · ZIP 이사",
    d: "이중 자동 백업이 돌고, ZIP으로 내보내 새 폰이나 웹앱으로 기록을 그대로 옮길 수 있습니다.",
  },
  {
    t: "놓친 날 소급 인증",
    d: "깜빡한 지난 날짜도 복구해 채울 수 있습니다. 시작일을 지난 날짜로 당겨 시즌을 소급 시작하는 것도 됩니다.",
  },
  {
    t: "사진 다시 붙이기",
    d: "사진이 유실된 인증은 갤러리 원본을 다시 연결하면 워터마크까지 재적용됩니다.",
  },
  {
    t: "오늘의 명언",
    d: "열 때마다 습관에 관한 문장이 하나씩 바뀝니다. 새로 등록된 문장은 자동으로 받아 옵니다.",
  },
];

const SHOTS = [
  { src: "/guide/home.png", cap: "오늘의 루틴 · 연속 도장" },
  { src: "/guide/routines.png", cap: "루틴 선언" },
  { src: "/guide/certify.png", cap: "인증 화면" },
  { src: "/guide/calendar.png", cap: "도장 달력" },
  { src: "/guide/alarm.png", cap: "알림 설정" },
];

/** 다크 존 배경 — 네온 블루 글로우 + 인주색 포인트 */
function NightBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="animate-pulse-glow absolute -top-32 left-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-neon/20 blur-[110px]" />
      <div
        className="animate-pulse-glow absolute -bottom-36 right-0 h-[26rem] w-[26rem] rounded-full bg-stamp/20 blur-[110px]"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.16] [mask-image:radial-gradient(ellipse_at_center,black_12%,transparent_72%)]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(125,227,255,.28) 1px, transparent 1px), linear-gradient(90deg, rgba(125,227,255,.28) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
    </div>
  );
}

/** 폰 목업 — 스크린샷을 기기 프레임에 넣어 보여준다 */
function Phone({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[2rem] border-[7px] border-[#171a20] bg-[#171a20] shadow-[0_30px_66px_-22px_rgba(10,16,32,.75)] ${className}`}
    >
      <img src={src} alt={alt} className="block w-full" loading="lazy" />
    </div>
  );
}

export default function Home() {
  return (
    <main>
      {/* ── 히어로 (다크) ───────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-night text-white">
        <NightBackdrop />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24 lg:pt-20">
          <div className="text-center lg:text-left">
            <p className="mb-5 inline-block rounded-full border border-neon/35 bg-neon/10 px-3.5 py-1.5 text-xs font-semibold tracking-tight text-neon-2">
              Google Play 정식 출시 · v1.2.0
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
              습관을{" "}
              <span className="bg-gradient-to-r from-stamp-accent to-stamp bg-clip-text text-transparent">
                도장
              </span>
              으로
              <br />
              남기다
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/65 lg:mx-0">
              사진 한 장으로 끝나는 앱이 아닙니다. <b className="font-bold text-white">사진·타이머·녹음·영상·링크</b>{" "}
              다섯 가지로 실행을 증명하고, 미룰수록 알람이 세져서 도망갈 구멍을 막습니다.
              63일 뒤엔 도장으로 가득 찬 기록만 남습니다.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <a
                href={PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl bg-gradient-to-r from-neon to-neon-2 px-6 py-3.5 text-sm font-bold text-night shadow-[0_0_32px_-6px_rgba(77,163,255,.75)] transition hover:brightness-110"
              >
                Google Play에서 설치
              </a>
              <a
                href="/app/"
                className="rounded-2xl border border-white/20 px-6 py-3.5 text-sm font-bold text-white/85 transition hover:border-neon hover:text-white"
              >
                웹에서 바로 시작 (아이폰 OK)
              </a>
              <Link
                to="/stories"
                className="rounded-2xl border border-white/20 px-6 py-3.5 text-sm font-bold text-white/85 transition hover:border-neon hover:text-white"
              >
                완주자 기록 보기 →
              </Link>
            </div>

            {/* 데스크톱 설치 QR */}
            <div className="mt-9 hidden lg:block">
              <a
                href={PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-left transition hover:border-neon"
              >
                <img
                  src="/qr-play.svg"
                  alt="Google Play 설치 QR 코드"
                  width={88}
                  height={88}
                  className="rounded-lg bg-white p-1.5"
                />
                <span className="pr-2">
                  <b className="block text-sm font-extrabold">폰으로 스캔해서 바로 설치</b>
                  <span className="mt-0.5 block text-xs text-white/50">
                    카메라로 QR을 비추면 Play 스토어가 열려요
                  </span>
                </span>
              </a>
            </div>
            <p className="mt-5 text-xs text-white/40">Android 8.0 이상 · 계정 없이 바로 사용</p>
          </div>

          <div className="mx-auto w-[248px] sm:w-[280px]">
            <Phone src="/guide/home.png" alt="Log Challenge 오늘의 루틴 화면" />
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-neon/55 to-transparent" />
      </section>

      {/* ── 인증 5종 (라이트) ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-stamp">5 WAYS TO PROVE</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            사진만이 인증은 아닙니다
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            명상을 사진으로 어떻게 증명하나요. 발음 연습은요. 루틴마다 증거의 모양이 다르기 때문에,
            로그챌린지는 다섯 가지 인증 수단을 제공합니다.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VERIFY_METHODS.map((m) => (
            <div
              key={m.t}
              className="rounded-3xl border border-line bg-card p-6 transition hover:border-brand hover:shadow-[0_20px_44px_-24px_rgba(28,35,51,.35)]"
            >
              <span className="text-3xl" aria-hidden>
                {m.icon}
              </span>
              <h3 className="mt-3 text-lg font-extrabold tracking-tight">{m.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{m.d}</p>
              <p className="mt-4 border-t border-line pt-3 text-xs font-semibold text-brand">
                {m.for}
              </p>
            </div>
          ))}

          {/* 다음 예정 — 걸음수는 아직 화면에 없으니 준비 중으로만 밝힌다 */}
          <div className="rounded-3xl border border-dashed border-line bg-paper p-6">
            <span className="text-3xl opacity-45" aria-hidden>
              👟
            </span>
            <h3 className="mt-3 text-lg font-extrabold tracking-tight text-muted">
              걸음수 자동 검증
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              삼성헬스·구글 피트니스가 기록한 걸음수를 헬스커넥트로 읽어 자동으로 확인합니다.
              지금은 만보기 화면을 사진으로 남겨 주세요.
            </p>
            <p className="mt-4 border-t border-line pt-3 text-xs font-bold text-muted">
              다음 버전 준비 중
            </p>
          </div>
        </div>
      </section>

      {/* ── 알람 (다크, 차별점) ─────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-night-2 text-white">
        <NightBackdrop />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="mx-auto w-[240px] sm:w-[270px] lg:order-2">
            <Phone src="/guide/alarm.png" alt="알림 설정 화면" />
          </div>

          <div className="lg:order-1">
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-neon">ESCALATING ALARM</p>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              미룰수록 알람이
              <br />
              <span className="text-neon-2">세집니다</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/65">
              대부분의 습관 앱은 알림을 한 번 보내고 끝냅니다. 그 한 번을 끄면 그날은 사라집니다.
              로그챌린지는 놓친 만큼 더 일찍부터, 더 여러 번 붙잡습니다.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                {
                  t: "마감 3시간 · 1시간 · 30분 전",
                  d: "하루가 끝나기 전에 세 번 두드립니다.",
                },
                {
                  t: "연속으로 놓치면 알람이 하나 더",
                  d: "나쁜 버릇이 쌓이는 만큼 알람 슬롯이 늘어나 더 일찍부터 울립니다.",
                },
                {
                  t: "인증하면 그날 알림은 자동 취소",
                  d: "할 일을 끝낸 사람을 다시 괴롭히지 않습니다.",
                },
                {
                  t: "시각·슬롯은 직접 조정",
                  d: "아침 리마인더 시각을 정하고, 마감 임박 알림은 슬롯별로 끌 수 있습니다.",
                },
              ].map((x) => (
                <li key={x.t} className="flex gap-3.5">
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-neon-2 shadow-[0_0_10px_2px_rgba(125,227,255,.6)]"
                    aria-hidden
                  />
                  <span>
                    <b className="block text-sm font-extrabold">{x.t}</b>
                    <span className="mt-0.5 block text-sm leading-relaxed text-white/55">{x.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-stamp/60 to-transparent" />
      </section>

      {/* ── 기록을 잃지 않게 (라이트) ───────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-stamp">KEEP THE RECORD</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            63일치 기록을 잃지 않게
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            기록이 사라지면 습관도 끊깁니다. 폰을 바꾸든 앱을 지우든, 찍어 둔 도장은 남아야 합니다.
          </p>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {KEEPING.map((k) => (
            <div key={k.t}>
              <h3 className="flex items-center gap-2 font-extrabold tracking-tight">
                <span className="h-1.5 w-1.5 rounded-full bg-stamp" aria-hidden />
                {k.t}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{k.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 스크린샷 쇼케이스 ───────────────────────────────────── */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
            앱 속을 미리 둘러보세요
          </h2>
          <p className="mt-3 text-center text-sm text-muted">
            선언하고 · 인증하고 · 도장으로 남기는 흐름
          </p>
          <div className="mt-12 flex snap-x gap-5 overflow-x-auto pb-4 lg:justify-center">
            {SHOTS.map((s) => (
              <figure key={s.src} className="w-[168px] shrink-0 snap-center text-center">
                <Phone src={s.src} alt={s.cap} className="rounded-[1.6rem] border-[6px]" />
                <figcaption className="mt-3 text-xs font-bold text-muted">{s.cap}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/guide"
              className="inline-block rounded-2xl border border-line bg-paper px-6 py-3 text-sm font-bold hover:border-brand"
            >
              사용 가이드 자세히 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 앱 vs 웹앱 지원 범위 ────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
          아이폰이면 설치 없이 웹앱으로
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-muted">
          같은 앱을 브라우저에서도 씁니다. 다만 브라우저가 못 하는 일이 있어서, 무엇이 되고 무엇이
          안 되는지 먼저 밝혀 둡니다.
        </p>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-line text-left">
                <th className="py-3 pr-4 font-extrabold">기능</th>
                <th className="w-32 py-3 text-center font-extrabold text-brand">설치형 앱</th>
                <th className="w-32 py-3 text-center font-extrabold text-muted">웹앱 (PWA)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["사진 · 타이머 · URL 인증", true, true],
                ["도장 달력 · 달성률 · 기록 앨범", true, true],
                ["회고 카드 · 공유", true, true],
                ["백업 ZIP 내보내기 · 불러오기", true, true],
                ["마감 알림 (3·1·0.5시간 전)", true, false],
                ["녹음 · 동영상 인증", true, false],
                ["갤러리에 원본 자동 저장", true, false],
                ["웹 계정 로그인 · 게시판 글쓰기", true, false],
              ].map(([label, app, web]) => (
                <tr key={label as string} className="border-b border-line">
                  <td className="py-3 pr-4">{label}</td>
                  <td className="py-3 text-center font-bold text-brand">
                    {app ? "✓" : "—"}
                  </td>
                  <td className="py-3 text-center font-bold text-muted">{web ? "✓" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-muted">
          웹앱의 루틴·사진은 브라우저에 저장되어 <b className="text-ink">폰 앱과는 분리</b>됩니다.
          브라우저 데이터를 지우면 사라지니, 옮길 때는 백업 ZIP을 쓰세요.
          <b className="text-ink"> 마감 알림이 습관 앱의 핵심</b>이라, 안드로이드라면 설치형 앱을 권합니다.
        </p>
      </section>

      {/* ── 베타테스터 모집 (다크) ──────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-night-2 text-white">
        <NightBackdrop />
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="rounded-3xl border border-stamp/30 bg-white/[0.03] p-8 sm:p-12">
            <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
              <div className="shrink-0">
                <Stamp size={88} level={4} check />
              </div>
              <div className="flex-1">
                <p className="mb-2 text-xs font-bold tracking-[0.2em] text-stamp-accent">
                  BETA TESTER 모집
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  다음 버전을 먼저 써 보실 분
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/65">
                  정식 출시 전 기능을 먼저 쓰고, 고쳐야 할 점을 알려 주실 베타테스터를 찾습니다.
                  <b className="font-bold text-white"> 구글 계정으로 로그인하고 신청</b>하면 끝입니다
                  — Play 비공개 테스트는 구글 계정 이메일로 등록되기 때문입니다.
                </p>
                <ul className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-white/70">
                  {["신규 기능 우선 사용", "의견이 다음 업데이트에 반영", "초기 테스터로 기록"].map(
                    (t) => (
                      <li key={t} className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1">
                        {t}
                      </li>
                    ),
                  )}
                </ul>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to="/beta"
                    className="rounded-2xl bg-gradient-to-r from-stamp to-stamp-accent px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_32px_-6px_rgba(124,92,255,.7)] transition hover:brightness-110"
                  >
                    베타테스터 신청하기 →
                  </Link>
                  <Link
                    to="/feedback"
                    className="rounded-2xl border border-white/20 px-6 py-3.5 text-sm font-bold text-white/85 transition hover:border-stamp-accent hover:text-white"
                  >
                    개선사항 게시판
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-stamp/60 to-transparent" />
      </section>

      {/* ── 마무리 CTA ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <div className="rounded-3xl bg-brand px-6 py-12 text-center text-white sm:px-16">
          {/* 바브바브 진화 — 1주 → 2주 → 3주 → 4주를 지나며 5단계 코스믹 마스터로 */}
          <div className="mb-3 flex items-center justify-center gap-1.5 sm:gap-2.5">
            {(
              [
                [1, 34],
                [2, 42],
                [3, 50],
                [4, 62],
                [5, 84],
              ] as const
            ).map(([lv, s], i) => (
              <span key={lv} className="flex items-center gap-1.5 sm:gap-2.5">
                {i > 0 && (
                  <span className="flex flex-col items-center leading-none text-white/55">
                    <span className="text-sm font-black">→</span>
                    <span className="mt-0.5 text-[10px] font-bold">{i}주</span>
                  </span>
                )}
                <Stamp size={s} level={lv} check={lv === 5} />
              </span>
            ))}
          </div>
          <p className="mb-7 text-xs font-semibold text-white/70">
            도장을 이어갈수록 바브바브가 진화합니다 — 마지막은 코스믹 마스터 🌌
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight">오늘 하나만 해내면 됩니다</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/85">
            기간은 30일부터 2년까지 직접 정합니다. 매일 쌓는 적립형이든 주 단위로 확인하는
            결과형이든, 오늘 도장 하나를 찍는 것부터 시작하세요. 쌓인 도장이 곧 다음 날의 이유가
            됩니다.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-brand hover:bg-white/90"
            >
              첫 도장 찍으러 가기
            </a>
            <Link
              to="/stories"
              className="rounded-2xl border border-white/40 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              완주자들의 기록 보기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
