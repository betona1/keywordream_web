// 개인정보처리방침 — ⚠️ 초안. 시행 전 연락처·시행일 확정 및 법적 검토 필요 (CLAUDE.md 10절)
export default function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-extrabold tracking-tight">개인정보처리방침</h1>
      <p className="mt-2 text-xs text-muted">시행일: 2026-__-__ (초안)</p>

      <div className="prose-sm mt-8 space-y-8 text-[15px] leading-relaxed">
        <section>
          <h2 className="mb-2 text-lg font-extrabold">1. KeepUp 앱 — 수집하지 않습니다</h2>
          <p className="text-muted">
            KeepUp 앱은 회원가입과 서버가 없는 앱입니다. 루틴, 인증 사진, 메모 등 모든 데이터는{" "}
            <b className="text-ink">사용자의 기기 안에만 저장</b>되며, 개발자를 포함한 누구에게도
            전송되지 않습니다. 앱을 삭제하면 데이터도 함께 삭제됩니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold">2. 웹 서비스 — 수집하는 정보</h2>
          <p className="text-muted">
            keywordream.com 및 keepup.keywordream.com 에서 <b className="text-ink">로그인하는 경우에만</b>{" "}
            다음 정보를 수집합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            <li>소셜 로그인(구글/카카오/네이버): 제공자 식별자, 닉네임, 프로필 이미지, (제공 시) 이메일</li>
            <li>이메일 로그인: 이메일 주소</li>
            <li>서비스 이용 기록: 게시글, 댓글, 응원(도장) 기록</li>
          </ul>
          <p className="mt-2 text-muted">비밀번호는 수집·저장하지 않습니다(소셜 로그인 및 일회용 인증코드 방식).</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold">3. 이용 목적</h2>
          <ul className="list-disc space-y-1 pl-5 text-muted">
            <li>회원 식별 및 로그인 상태 유지</li>
            <li>성과 게시판 서비스 제공(작성자 표시, 댓글, 응원)</li>
            <li>문의 응대</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold">4. 보관 및 파기</h2>
          <p className="text-muted">
            회원 정보는 탈퇴 시 즉시 개인 식별 정보(이름, 이메일, 프로필 이미지)를 삭제합니다. 작성한
            게시글·댓글은 "탈퇴한 회원" 명의로 남으며, 탈퇴 전 직접 삭제할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold">5. 처리 위탁</h2>
          <p className="text-muted">
            데이터는 Cloudflare, Inc.의 인프라(D1, KV, R2)에 저장되며, 이메일 인증코드 발송에 Resend를
            이용합니다. 이 외 제3자에게 개인정보를 제공하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold">6. 문의처</h2>
          <p className="text-muted">
            개인정보 관련 문의: <b className="text-ink">contact@keywordream.com</b> (TODO: 확정)
          </p>
        </section>
      </div>
    </main>
  );
}
