import { useState } from "react";

// 개인정보처리방침 — 2026-07-14 시행 · KO/EN
export default function Privacy() {
  const [lang, setLang] = useState<"ko" | "en">("ko");
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {lang === "ko" ? "개인정보처리방침" : "Privacy Policy"}
          </h1>
          <p className="mt-2 text-xs text-muted">
            {lang === "ko"
              ? "시행일: 2026년 7월 14일"
              : "Effective date: July 14, 2026"}
          </p>
        </div>
        <LangToggle lang={lang} setLang={setLang} />
      </div>

      {lang === "ko" ? <Ko /> : <En />}
    </main>
  );
}

function LangToggle({
  lang,
  setLang,
}: {
  lang: "ko" | "en";
  setLang: (l: "ko" | "en") => void;
}) {
  return (
    <div className="flex shrink-0 overflow-hidden rounded-full border border-line text-xs font-bold">
      {(["ko", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1.5 ${
            lang === l ? "bg-brand text-white" : "text-muted hover:text-ink"
          }`}
        >
          {l === "ko" ? "한국어" : "EN"}
        </button>
      ))}
    </div>
  );
}

function Ko() {
  return (
    <div className="mt-8 space-y-8 text-[15px] leading-relaxed">
      <section>
        <h2 className="mb-2 text-lg font-extrabold">1. 로그챌린지 앱 — 개인정보를 수집하지 않습니다</h2>
        <p className="text-muted">
          로그챌린지(Log Challenge) 앱은 회원가입과 서버가 없는 앱입니다. 루틴, 인증 사진·동영상·음성 녹음,
          메모 등 모든 데이터는 <b className="text-ink">사용자의 기기 안에만 저장</b>되며, 운영자를
          포함한 누구에게도 전송되지 않습니다. 앱을 삭제하면 데이터도 함께 삭제됩니다.
          (안드로이드 자동 백업을 켜두면 사용자 본인의 구글 계정에만 백업됩니다.)
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-extrabold">2. 웹 서비스 — 수집하는 개인정보와 동의</h2>
        <p className="text-muted">
          keywordream.com 및 log.keywordream.com(이하 "웹 서비스")에서{" "}
          <b className="text-ink">회원가입(간편로그인) 시 동의를 받은 후</b> 다음 정보를 수집합니다.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          <li><b className="text-ink">[필수] 회원 식별 정보</b>: 소셜 로그인 제공자(구글/카카오/네이버) 식별자, 닉네임, 프로필 이미지, (제공자가 전달하는 경우) 이메일 / 이메일 로그인 시 이메일 주소</li>
          <li><b className="text-ink">[선택·게시 시 동의] 게시 콘텐츠</b>: 성과 게시판에 사용자가 직접 올리는 글, 사진, 루틴 정보, 댓글, 응원 기록 — <b className="text-ink">게시물 작성 시 별도 동의를 받으며, 서버에 저장되고 누구나 볼 수 있게 공개됩니다</b></li>
          <li>
            <b className="text-ink">[선택·신청 시 동의] 베타테스터 신청 정보</b>: 구글 계정 이메일 주소, (직접 입력 시) 사용 기기 정보와 남긴 메모 —{" "}
            <b className="text-ink">
              Google Play 비공개 테스트에 테스터로 등록하기 위해 구글 계정 이메일이 반드시 필요하므로,
              신청 버튼을 누를 때 동의를 받아 수집합니다
            </b>
            . 이메일은 <b className="text-ink">운영자만 조회</b>할 수 있고 게시판 등 공개 영역에 노출하지 않습니다.
          </li>
          <li>
            <b className="text-ink">[선택·작성 시 동의] 개선사항 게시글</b>: 앱 개선사항 게시판에 올리는 제목·내용과 함께 입력한 앱 버전·기기 정보 — 닉네임과 함께 공개됩니다.
          </li>
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
          <li>
            <b className="text-ink">베타테스터 운영</b>: Google Play 비공개 테스트 테스터 목록 등록,
            테스트 참여 안내
          </li>
          <li>개선사항 게시판 운영 및 문의·버그 처리 답변</li>
          <li>스팸·부정 이용 방지, 문의 응대</li>
        </ul>
        <p className="mt-2 text-muted">수집한 개인정보는 위 목적 외로 이용하지 않으며, 광고 목적의 제3자 제공을 하지 않습니다.</p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-extrabold">4. 보유 기간 및 파기</h2>
        <ul className="list-disc space-y-1 pl-5 text-muted">
          <li>회원 정보: <b className="text-ink">탈퇴 시 즉시</b> 개인 식별 정보(이름, 이메일, 프로필 이미지)를 삭제합니다.</li>
          <li>게시물: 작성자가 언제든 직접 삭제할 수 있습니다. 탈퇴 시 삭제하지 않은 게시물은 "탈퇴한 회원" 명의로 남습니다(원하시면 탈퇴 전 삭제하거나 문의로 삭제 요청 가능).</li>
          <li>
            <b className="text-ink">베타테스터 신청 정보</b>: 신청자가 <b className="text-ink">신청을 취소하면 즉시 삭제</b>되고,
            테스트 모집이 종료되면 등록 목적이 끝나므로 파기합니다. 회원 탈퇴 시에도 함께 삭제됩니다.
          </li>
          <li>개선사항 게시글: 작성자가 언제든 직접 삭제할 수 있습니다.</li>
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
  );
}

function En() {
  return (
    <div className="mt-8 space-y-8 text-[15px] leading-relaxed">
      <section>
        <h2 className="mb-2 text-lg font-extrabold">1. The Log Challenge app collects no personal data</h2>
        <p className="text-muted">
          The Log Challenge app has no sign-up and no server. All data — routines, verification
          photos, videos, voice recordings, and notes — is{" "}
          <b className="text-ink">stored only on your device</b> and is never transmitted to anyone,
          including the operator. Deleting the app deletes the data. (If you enable Android auto-backup,
          data is backed up only to your own Google account.)
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-extrabold">2. Web service — data we collect and consent</h2>
        <p className="text-muted">
          On keywordream.com and log.keywordream.com (the "Web Service"), we collect the following{" "}
          <b className="text-ink">only after obtaining your consent at sign-up (social login)</b>:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          <li><b className="text-ink">[Required] Account identifiers</b>: the identifier from your social login provider (Google/Kakao/Naver), nickname, profile image, and email (if the provider shares it, or the email you enter for email login).</li>
          <li><b className="text-ink">[Optional · with consent on posting] Posted content</b>: posts, photos, routine info, comments, and cheers you publish to the community board — <b className="text-ink">collected with separate consent when you post, stored on the server, and made publicly visible.</b></li>
          <li>
            <b className="text-ink">[Optional · with consent on applying] Beta tester application</b>: your Google account email address and, if you enter them, your device model and a short note —{" "}
            <b className="text-ink">
              the Google account email is required to enrol you as a tester in Google Play closed
              testing, so we collect it with your consent when you submit the application
            </b>
            . The email is <b className="text-ink">visible only to the operator</b> and is never shown in public areas.
          </li>
          <li>
            <b className="text-ink">[Optional · with consent on posting] Feedback posts</b>: the title, body, app version and device you submit to the app feedback board — published together with your nickname.
          </li>
        </ul>
        <p className="mt-2 text-muted">
          We do not collect or store passwords (we use social login and one-time verification codes).
          Your IP address may be temporarily logged by our infrastructure (Cloudflare) for security.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-extrabold">3. Purpose of use</h2>
        <ul className="list-disc space-y-1 pl-5 text-muted">
          <li>Member identification and keeping you signed in</li>
          <li>Operating the community board (author display, comments, cheers)</li>
          <li>
            <b className="text-ink">Running the beta programme</b>: enrolling testers in Google Play
            closed testing and sending participation guidance
          </li>
          <li>Operating the feedback board and replying to reports and inquiries</li>
          <li>Preventing spam and abuse, and answering inquiries</li>
        </ul>
        <p className="mt-2 text-muted">We do not use your data for any other purpose and do not provide it to third parties for advertising.</p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-extrabold">4. Retention and deletion</h2>
        <ul className="list-disc space-y-1 pl-5 text-muted">
          <li>Account info: <b className="text-ink">deleted immediately upon account withdrawal</b> (name, email, profile image).</li>
          <li>Posts: you can delete your own posts at any time. Posts left after withdrawal remain under "Withdrawn member" (you may delete them before withdrawing, or request deletion via our contact).</li>
          <li>
            <b className="text-ink">Beta tester applications</b>: deleted{" "}
            <b className="text-ink">immediately when you cancel your application</b>, and discarded once the
            testing round ends and the enrolment purpose is fulfilled. Also deleted when you withdraw your account.
          </li>
          <li>Feedback posts: you can delete your own posts at any time.</li>
          <li>Login sessions: automatically expire and are deleted after up to 30 days.</li>
        </ul>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-extrabold">5. Processing and international transfer</h2>
        <p className="text-muted">
          Data is stored on Cloudflare, Inc. (USA) infrastructure (D1, KV, R2), and email verification
          codes are sent via Resend (USA). Both are used only within the scope of data processing, and
          we do not provide your data to any other third party.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-extrabold">6. Your rights</h2>
        <p className="text-muted">
          You can change your display name or withdraw membership at any time from your account page,
          and may request access, correction, deletion, or suspension of processing via our contact.
          We do not allow sign-ups by children under 14.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-extrabold">7. App permissions (Android)</h2>
        <ul className="list-disc space-y-1 pl-5 text-muted">
          <li><b className="text-ink">Camera · Photos</b>: taking/selecting habit verification photos and videos (stored on device)</li>
          <li><b className="text-ink">Microphone</b>: voice recording verification, e.g. pronunciation practice (stored on device)</li>
          <li><b className="text-ink">Notifications · Exact alarms</b>: sending pre-deadline reminders</li>
          <li><b className="text-ink">Internet</b>: refreshing the daily quote and, only if you choose, web account login</li>
        </ul>
        <p className="mt-2 text-muted">All media stays on your device and is never sent to a server.</p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-extrabold">8. Publisher and contact</h2>
        <p className="text-muted">
          App provider: <b className="text-ink">EXANSYS</b> · Brand: keywordream
          <br />
          Data protection contact: <b className="text-ink">netkjy@gmail.com</b>
        </p>
        <p className="mt-2 text-xs text-muted">
          Any changes to this policy will be announced on this page; significant changes will be
          notified at least 7 days before they take effect.
        </p>
      </section>
    </div>
  );
}
