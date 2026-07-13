export default function Footer() {
  return (
    <footer className="border-t border-line py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 text-center text-xs text-muted">
        <div className="flex gap-4">
          <a href="https://keepup.keywordream.com/privacy" className="hover:text-ink">
            개인정보처리방침
          </a>
          <a href="https://keepup.keywordream.com/terms" className="hover:text-ink">
            이용약관
          </a>
          <a href="https://keepup.keywordream.com/support" className="hover:text-ink">
            문의
          </a>
        </div>
        <p>© {new Date().getFullYear()} keywordream. All rights reserved.</p>
      </div>
    </footer>
  );
}
