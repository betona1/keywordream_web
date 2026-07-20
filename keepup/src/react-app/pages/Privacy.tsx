// 개인정보처리방침 — 2026-07-14 시행
export default function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-extrabold tracking-tight">개인정보처리방침</h1>
      <p className="mt-2 text-xs text-muted">시행일: 2026년 7월 14일</p>

      <div className="mt-8 space-y-8 text-[15px] leading-relaxed">
        <section>
          <h2 className="mb-2 text-lg font-extrabold">1. KeepUp 앱 — 개인정보를 수집하지 않습니다</h2>
          <p className="text-muted">
            KeepUp 앱은 회원가입과 서버가 없는 앱입니다. 루틴, 인증 사진·동영상·음성 녹음,
            메모 등 모든 데이터는 <b className="text-ink">사용자의 기기 안에만 저장</b>되며, 운영자를
            포함한 누구에게도 전송되지 않습니다. 앱을 삭제하면 데이터도 함께 삭제됩니다.
            (안드로이드 자동 백업을 켜두면 사용자 본인의 구글 계정에만 백업됩니다.)
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold">2. 웹 서비스 — 수집하는 개인정보와 동의</h2>
          <p className="text-muted">
            keywordream.com 및 keepup.keywordream.com(이하 "웹 서비스")에서{" "}
            <b className="text-ink">회원가입(간편로그인) 시 동의를 받은 후</b> 다음 정보를 수집합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            <li><b className="text-ink">[필수] 회원 식별 정보</b>: 소셜 로그인 제공자(구글/카카오/네이버) 식별자, 닉네임, 프로필 이미지, (제공자가 전달하는 경우) 이메일 / 이메일 로그인 시 이메일 주소</li>
            <li><b className="text-ink">[선택·게시 시 동의] 게시 콘텐츠</b>: 성과 게시판에 사용자가 직접 올리는 글, 사진, 루틴 정보, 댓글, 응원 기록 — <b className="text-ink">게시물 작성 시 별도 동의를 받으며, 서버에 저장되고 누구나 볼 수 있게 공개됩니다</b></li>
          </ul>
          <p className="mt-2 text-muted">
            비밀번호는 수집·저장하지 않습니다(소셜 로그인 및 일회용 인증코드 방식).
            서비스 이용 과정에서 접속 IP가 보안 목적으로 인프라(Cloudflare)에 일시 기록될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold">3. 이용 목적</h2>
          <ul className="list-disc space-y-1 pl-5 text-muted">
            <li>회원 식별 및 로그인 상태 유지</li>
            <li>성과 게시판 서비스 제공 (작성자 표시, 댓글, 응원)</li>
            <li>스팸·부정 이용 방지, 문의 응대</li>
          </ul>
          <p className="mt-2 text-muted">수집한 개인정보는 위 목적 외로 이용하지 않으며, 광고 목적의 제3자 제공을 하지 않습니다.</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold">4. 보유 기간 및 파기</h2>
          <ul className="list-disc space-y-1 pl-5 text-muted">
            <li>회원 정보: <b className="text-ink">탈퇴 시 즉시</b> 개인 식별 정보(이름, 이메일, 프로필 이미지)를 삭제합니다.</li>
            <li>게시물: 작성자가 언제든 직접 삭제할 수 있습니다. 탈퇴 시 삭제하지 않은 게시물은 "탈퇴한 회원" 명의로 남습니다(원하시면 탈퇴 전 삭제하거나 문의로 삭제 요청 가능).</li>
            <li>로그인 세션: 최대 30일 후 자동 만료·삭제됩니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold">5. 처리 위탁 및 국외 이전</h2>
          <p className="text-muted">
            데이터는 Cloudflare, Inc.(미국)의 인프라(D1, KV, R2)에 저장되며, 이메일 인증코드 발송에
            Resend(미국)를 이용합니다. 두 업체 모두 데이터 처리 목적 범위에서만 위탁되며, 이 외
            제3자에게 개인정보를 제공하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold">6. 정보주체의 권리</h2>
          <p className="text-muted">
            이용자는 언제든지 마이페이지에서 표시 이름 변경·회원 탈퇴를 할 수 있으며, 문의처를 통해
            열람·정정·삭제·처리정지를 요구할 수 있습니다. 만 14세 미만 아동의 회원가입은 받지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold">7. 앱 권한 안내 (Android)</h2>
          <ul className="list-disc space-y-1 pl-5 text-muted">
            <li><b className="text-ink">카메라·사진</b>: 습관 인증 사진·동영상 촬영/선택 (기기 내 저장)</li>
            <li><b className="text-ink">마이크</b>: 발음 연습 등 음성 녹음 인증 (기기 내 저장)</li>
            <li><b className="text-ink">알림·정확한 알람</b>: 마감 전 리마인더 발송</li>
            <li><b className="text-ink">인터넷</b>: '오늘의 명언' 갱신, 웹 계정 로그인(선택) 시에만 사용</li>
          </ul>
          <p className="mt-2 text-muted">모든 미디어는 서버로 전송되지 않고 기기 안에만 저장됩니다.</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-extrabold">8. 발행자 및 문의처</h2>
          <p className="text-muted">
            앱 제공자: <b className="text-ink">EXANSYS (엑사엔시스)</b> · 브랜드: keywordream
            <br />
            개인정보 보호책임자 문의: <b className="text-ink">netkjy@gmail.com</b>
          </p>
          <p className="mt-2 text-xs text-muted">
            본 방침이 변경되는 경우 이 페이지를 통해 공지하며, 중요한 변경은 시행 7일 전에 안내합니다.
          </p>
        </section>
      </div>
    </main>
  );
}
