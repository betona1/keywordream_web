import { useState } from "react";

// 이용약관 — 2026-07-14 시행 · KO/EN
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
              ? "시행일: 2026년 7월 14일"
              : "Effective date: July 14, 2026"}
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
            <h2 className="mb-2 text-lg font-extrabold">3. 책임의 한계</h2>
            <p className="text-muted">
              로그챌린지 앱의 데이터는 사용자 기기에만 저장되므로, 기기 분실·초기화로 인한 데이터 손실을
              운영자가 복구할 수 없습니다. 무료 서비스 특성상 서비스는 "있는 그대로" 제공됩니다.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-extrabold">4. 문의</h2>
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
            <h2 className="mb-2 text-lg font-extrabold">3. Limitation of liability</h2>
            <p className="text-muted">
              Because Log Challenge app data is stored only on your device, the Operator cannot recover
              data lost due to device loss or reset. As a free service, it is provided "as is."
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-lg font-extrabold">4. Contact</h2>
            <p className="text-muted">
              Questions about these terms: <b className="text-ink">netkjy@gmail.com</b>
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
