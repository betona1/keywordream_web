import { Link } from "react-router-dom";
import { PLAY_URL } from "../lib/api";

// 로그챌린지 사용 가이드 — 실제 앱 스크린샷 + 단계별 설명
const STEPS = [
  {
    n: "01",
    tag: "시작하기",
    title: "루틴을 선언하고 이유를 적어요",
    img: "/guide/home.png",
    desc: "‘+ 루틴’으로 습관을 만들고, 왜 하는지 이유를 함께 적습니다. 매일 쌓는 적립형과 목표를 선언하는 결과형 중 나에게 맞는 방식을 고르세요.",
    points: ["적립형 — 매일(주6·주7) 인증하며 도장 쌓기", "결과형 — 목표 선언 후 주1회·15일·1회성 인증", "기간은 30일~2년, 내가 직접 설정"],
  },
  {
    n: "02",
    tag: "인증하기",
    title: "사진 한 장이면 도장이 찍혀요",
    img: "/guide/certify.png",
    desc: "습관을 실행하고 인증하면 도장이 찍힙니다. 사진에는 날짜·시각이 자동으로 새겨져 조작 걱정이 없어요.",
    points: ["사진 · 타이머 · 녹음 · 영상 · 링크 5가지 인증", "날짜·시각 자동 워터마크", "메모·수치로 진행 상황도 기록"],
  },
  {
    n: "03",
    tag: "오늘의 흐름",
    title: "오늘 할 일과 진행 중 목표를 한눈에",
    img: "/guide/routines.png",
    desc: "홈에서 오늘 인증할 루틴, 진행 중인 목표, 그리고 지금까지 쌓인 인증 갤러리를 한 화면에서 확인합니다.",
    points: ["오늘의 루틴 · 진행 중 목표 분리 표시", "마감까지 남은 시간 안내", "인증 사진이 갤러리로 차곡차곡"],
  },
  {
    n: "04",
    tag: "놓치지 않기",
    title: "놓치지 않게, 마감 전 알림",
    img: "/guide/alarm.png",
    desc: "마감 3시간·1시간·30분 전 알림이 붙잡아 줍니다. 인증을 마치면 그날 알림은 자동으로 꺼져요.",
    points: ["마감 3·1·0.5시간 전 3단계 알림 (켜고 끄기 자유)", "연속으로 놓치면 알람이 하나씩 늘어 더 일찍 울림 (나쁜 버릇 교정)", "네이티브 앱이라 닫혀 있어도 정확히 울림"],
  },
  {
    n: "05",
    tag: "기록·추억",
    title: "도장 달력으로 성취가 쌓여요",
    img: "/guide/calendar.png",
    desc: "인증할 때마다 도장이 달력을 채웁니다. 달성률과 최장 연속 기록이 자동으로 집계돼, 63일 뒤엔 도장으로 가득 찬 나만의 기록이 남습니다.",
    points: ["달성률 · 최장 연속 · 총 도장 수 자동 집계", "날짜를 눌러 그날의 인증 다시 보기", "계정 없이 내 폰에만 안전하게 저장"],
  },
];

export default function Guide() {
  return (
    <main>
      {/* 히어로 */}
      <section className="mx-auto max-w-5xl px-4 pb-10 pt-16 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-stamp">
          사용 가이드
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          로그챌린지, 이렇게 쓰면 습관이 남습니다
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted">
          선언하고 · 인증하고 · 도장으로 남기는 5단계. 앱 실제 화면으로 안내할게요.
        </p>
      </section>

      {/* 단계 */}
      <section className="mx-auto max-w-5xl px-4 pb-8">
        <div className="flex flex-col gap-16 sm:gap-24">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className={`flex flex-col items-center gap-8 sm:gap-14 ${
                i % 2 ? "sm:flex-row-reverse" : "sm:flex-row"
              }`}
            >
              {/* 스크린샷 (폰 프레임) */}
              <div className="w-[220px] shrink-0 sm:w-[240px]">
                <div className="overflow-hidden rounded-[2.2rem] border-[7px] border-[#171a20] bg-[#171a20] shadow-[0_24px_50px_-18px_rgba(20,30,60,.5)]">
                  <img src={s.img} alt={s.title} className="block w-full" loading="lazy" />
                </div>
              </div>

              {/* 설명 */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-stamp text-sm font-extrabold text-white">
                    {s.n}
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-brand">
                    {s.tag}
                  </span>
                </div>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight">{s.title}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{s.desc}</p>
                <ul className="mt-4 inline-flex flex-col gap-2 text-left">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 shrink-0 font-extrabold text-stamp">✓</span>
                      <span className="text-ink">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="rounded-3xl bg-brand px-8 py-12 text-center text-white sm:px-16">
          <h2 className="text-2xl font-extrabold tracking-tight">지금 바로 시작해 보세요</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/85">
            계정도 가입도 없이, 앱을 열면 바로 첫 도장을 찍을 수 있어요.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href={PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-brand hover:bg-white/90"
            >
              Google Play에서 설치
            </a>
            <Link
              to="/stories"
              className="rounded-2xl border border-white/40 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              완주자들의 기록 보기 →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
