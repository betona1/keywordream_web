// 문의 — 이메일 + FAQ
const FAQ: { q: string; a: string }[] = [
  {
    q: "앱 데이터가 서버에 저장되나요?",
    a: "아니요. KeepUp 앱의 루틴·인증 사진·메모는 모두 내 폰 안에만 저장됩니다. 회원가입도 없습니다. 웹 성과 게시판에 직접 올리는 글만 서버에 저장됩니다.",
  },
  {
    q: "알림이 안 울려요.",
    a: "설정에서 KeepUp의 알림 권한과 '정확한 알람' 권한을 허용해 주세요. 안드로이드는 배터리 최적화 대상에서 KeepUp을 제외하면 알림이 정확해집니다.",
  },
  {
    q: "인증 사진의 날짜 워터마크는 지울 수 있나요?",
    a: "아니요. 날짜·시각 워터마크는 인증의 신뢰를 위한 KeepUp의 핵심 규칙이라 끌 수 없습니다.",
  },
  {
    q: "게시판에 글을 쓰려면 어떻게 하나요?",
    a: "keywordream.com 계정으로 로그인하면 됩니다. 구글/카카오/네이버 간편로그인 또는 이메일 인증코드로 10초면 가입됩니다.",
  },
  {
    q: "폰을 바꾸면 기록을 옮길 수 있나요?",
    a: "현재는 기기 간 이동 기능이 없습니다(서버가 없는 구조라서요). 백업/복원 기능을 준비 중입니다.",
  },
];

export default function Support() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-extrabold tracking-tight">문의</h1>
      <p className="mt-2 text-sm text-muted">궁금한 점이 있으면 먼저 FAQ를 확인해 주세요.</p>

      <a
        href="mailto:netkjy@gmail.com"
        className="mt-6 block rounded-3xl border border-line bg-card p-6 text-center transition hover:border-brand"
      >
        <p className="text-xs font-bold text-muted">이메일 문의</p>
        <p className="mt-1 text-lg font-extrabold text-brand">netkjy@gmail.com</p>
      </a>

      <section className="mt-10">
        <h2 className="text-lg font-extrabold">자주 묻는 질문</h2>
        <div className="mt-4 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-line bg-card px-5 py-4">
              <summary className="cursor-pointer text-sm font-bold marker:content-none">
                Q. {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
