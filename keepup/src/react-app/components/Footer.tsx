import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-line py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 text-center text-xs text-muted">
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-ink">
            개인정보처리방침
          </Link>
          <Link to="/terms" className="hover:text-ink">
            이용약관
          </Link>
          <Link to="/support" className="hover:text-ink">
            문의
          </Link>
          <a href="https://keywordream.com" className="hover:text-ink">
            keywordream
          </a>
        </div>
        <p>© {new Date().getFullYear()} keywordream. All rights reserved.</p>
      </div>
    </footer>
  );
}
