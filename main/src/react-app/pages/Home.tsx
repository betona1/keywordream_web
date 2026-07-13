// 브랜드 메인 랜딩 — 스튜디오 소개 + KeepUp 제품 카드
export default function Home() {
  return (
    <main>
      {/* 히어로 */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-20 text-center">
        <p className="mb-3 inline-block rounded-full border border-line bg-card px-3 py-1 text-xs font-semibold text-muted">
          keyword + dream = keywordream
        </p>
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          꾸준함을 만드는
          <br />
          <span className="text-brand">작은 도구</span>를 만듭니다
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted">
          키워드림은 좋은 습관을 <b className="text-ink">키워, 드림</b>하는 1인 스튜디오입니다.
          매일 열게 되는 작고 단단한 앱으로, 미루면 사라지는 결심을 붙잡습니다.
        </p>
      </section>

      {/* 제품: KeepUp */}
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <a
          href="https://keepup.keywordream.com"
          className="group block rounded-3xl border border-line bg-card p-8 shadow-sm transition hover:border-brand sm:p-12"
        >
          <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
            {/* 도장 스탬프 시그니처 */}
            <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-2xl bg-brand/10">
              <div className="grid h-20 w-20 rotate-[-8deg] place-items-center rounded-full border-4 border-stamp text-stamp">
                <span className="text-sm font-extrabold leading-tight tracking-tight">
                  KEEP
                  <br />
                  UP!
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-2xl font-extrabold tracking-tight">KeepUp</h2>
                <span className="rounded-full bg-stamp/10 px-2.5 py-0.5 text-xs font-bold text-stamp">
                  출시 준비 중
                </span>
              </div>
              <p className="text-muted">
                습관을 사진으로 인증하면 도장이 찍히고, 마감 3시간 전 알림이 놓치지 않게
                붙잡아 주는 습관 인증 앱. 63일 뒤엔 도장으로 가득 찬 기록만 남습니다.
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
                KeepUp 자세히 보기 →
              </p>
            </div>
          </div>
        </a>
      </section>

      {/* 철학 */}
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
    </main>
  );
}
