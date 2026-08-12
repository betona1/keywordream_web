import { useState } from "react";

// 이용약관 — 2026-07-14 시행, 2026-08-13 개정(베타 테스트·개선 의견 조항 추가) · KO/EN
export default function Terms() {
  const [lang, setLang] = useState<"ko" | "en">("ko");
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {lang === "ko" ? "이용약관" : "Terms of Service"}
          </h1>
          <p className="mt-2 text-xs text-muted">
            {lang === "ko"
              ? "시행일: 2026년 7월 14일 · 최근 개정: 2026년 8월 13일 (베타 테스트 참여·개선 의견 조항 추가)"
              : "Effective: July 14, 2026 · Last revised: August 13, 2026 (added beta testing and feedback clauses)"}
          </p>
        </div>
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
      </div>

      {lang === "ko" ? (
        <div className="mt-8 space-y-8 text-[15px] leading-relaxed">
          <section>
            <h2 className="mb-2 text-lg font-extrabold">1. 서비스</h2>
            <p className="text-muted">
              keywordream(이하 "운영자")은 습관 인증 앱 로그챌린지(Log Challenge)와 웹 성과 게시판(log.keywordream.com)을
              제공합니다. 앱은 회원가입 없이 무료로 사용할 수 있으며, 게시판 글 작성에는 웹 로그인이 필요합니다.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-extrabold">2. 게시물</h2>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>게시물의 저작권은 작성자에게 있으며, 서비스 내 노출에 필요한 범위에서 운영자가 사용할 수 있습니다.</li>
              <li>타인의 권리를 침해하거나, 허위 인증, 광고·스팸, 불쾌감을 주는 게시물은 예고 없이 삭제될 수 있습니다.</li>
              <li>본인이 실행하지 않은 습관을 실행한 것처럼 올리는 행위는 서비스 취지에 어긋납니다. 도장은 정직하게.</li>
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-extrabold">3. 베타 테스트 참여</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-muted">
              <li>
                참여는 <b className="text-ink">무료·자유</b>입니다. 구글 계정으로 신청하면 되고,
                언제든 신청을 취소하거나 테스트를 그만둘 수 있습니다. 신청을 취소하면 등록해 둔
                이메일은 즉시 삭제됩니다.
              </li>
              <li>
                Google Play 비공개 테스트는 <b className="text-ink">구글 계정 이메일</b>로 테스터를
                등록하는 방식이라, 신청 시 로그인한 계정의 이메일이 그 목적으로만 사용됩니다.
                모집 인원과 시기에 따라 승인이 보류될 수 있습니다.
              </li>
              <li>
                테스트 버전은 <b className="text-ink">개발 중인 소프트웨어</b>입니다. 오류나 예기치
                않은 종료가 있을 수 있고, 기능이 바뀌거나 없어질 수 있습니다. 드물게 기록이 유실될
                수 있으니 <b className="text-ink">앱의 백업(ZIP) 내보내기</b>를 주기적으로 해 두시길
                권합니다.
              </li>
              <li>
                테스트 중 알게 된 <b className="text-ink">미공개 기능·화면은 외부에 공개하지 말아
                주시길 부탁드립니다</b>. 정식 출시 전 정보라 오해를 부를 수 있습니다.
              </li>
              <li>
                모집과 테스트는 예고 후 종료될 수 있습니다. 종료 시 등록 목적이 끝나므로 신청 정보는
                파기합니다.
              </li>
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-extrabold">4. 개선 의견</h2>
            <p className="text-muted">
              개선사항 게시판에 남겨 주신 의견·제안·버그 신고는{" "}
              <b className="text-ink">앱과 웹을 개선하는 데 활용됩니다</b>. 글의 저작권은 작성자에게
              있으며, 아이디어가 제품에 반영되어도 별도의 대가나 지분은 발생하지 않는다는 점을 미리
              밝혀 둡니다. 모든 의견을 반영하거나 답변드리지 못할 수 있습니다.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-extrabold">5. 책임의 한계</h2>
            <p className="text-muted">
              로그챌린지 앱의 데이터는 사용자 기기에만 저장되므로, 기기 분실·초기화로 인한 데이터 손실을
              운영자가 복구할 수 없습니다. 무료 서비스 특성상 서비스는 "있는 그대로" 제공됩니다.
              다만 운영자의 고의 또는 중대한 과실로 발생한 손해에 대한 책임은 제한하지 않습니다.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-extrabold">6. 문의</h2>
            <p className="text-muted">
              약관 관련 문의: <b className="text-ink">netkjy@gmail.com</b>
            </p>
          </section>
        </div>
      ) : (
        <div className="mt-8 space-y-8 text-[15px] leading-relaxed">
          <section>
            <h2 className="mb-2 text-lg font-extrabold">1. Service</h2>
            <p className="text-muted">
              keywordream (the "Operator") provides the habit-verification app Log Challenge and the
              web community board (log.keywordream.com). The app is free and requires no sign-up;
              posting to the board requires a web login.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-extrabold">2. User content</h2>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>Copyright in your posts belongs to you; the Operator may use them only as needed to display them within the service.</li>
              <li>Content that infringes others' rights, contains false verification, ads/spam, or is offensive may be removed without notice.</li>
              <li>Posting a habit as if performed when you did not runs counter to the service's purpose. Keep your stamps honest.</li>
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-extrabold">3. Beta testing</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-muted">
              <li>
                Participation is <b className="text-ink">free and voluntary</b>. Apply with your Google
                account; you may cancel your application or stop testing at any time. Cancelling deletes
                the stored email immediately.
              </li>
              <li>
                Google Play closed testing enrols testers by{" "}
                <b className="text-ink">Google account email</b>, so the email of the account you sign in
                with is used for that purpose only. Approval may be held back depending on the number of
                places and the testing schedule.
              </li>
              <li>
                Test builds are <b className="text-ink">software under development</b>. Errors and
                unexpected shutdowns can occur, and features may change or disappear. Records may rarely
                be lost, so we recommend exporting the{" "}
                <b className="text-ink">in-app backup (ZIP)</b> from time to time.
              </li>
              <li>
                Please <b className="text-ink">do not publish unreleased features or screens</b> you see
                during testing — pre-release information can be misleading.
              </li>
              <li>
                Recruitment and testing may end with prior notice. When they do, application data is
                discarded as its purpose is fulfilled.
              </li>
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-extrabold">4. Feedback</h2>
            <p className="text-muted">
              Opinions, suggestions and bug reports posted to the feedback board{" "}
              <b className="text-ink">may be used to improve the app and the website</b>. Copyright in
              your post remains yours; we state up front that no payment or equity arises if an idea is
              adopted. We may not be able to implement or reply to every suggestion.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-extrabold">5. Limitation of liability</h2>
            <p className="text-muted">
              Because Log Challenge app data is stored only on your device, the Operator cannot recover
              data lost due to device loss or reset. As a free service, it is provided "as is."
              This does not limit liability for damage caused by the Operator's wilful misconduct or
              gross negligence.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-extrabold">6. Contact</h2>
            <p className="text-muted">
              Questions about these terms: <b className="text-ink">netkjy@gmail.com</b>
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
