import { Link } from "react-router-dom";
import Logo from "./Logo";
import type { Me } from "../lib/api";

export default function Header({ me, loading }: { me: Me; loading: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" aria-label="keywordream 홈">
          <Logo size={28} />
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <a
            href="https://keepup.keywordream.com"
            className="font-semibold text-muted hover:text-ink"
          >
            KeepUp
          </a>
          {!loading &&
            (me ? (
              <>
                {me.role === "admin" && (
                  <Link to="/admin" className="font-semibold text-muted hover:text-ink">
                    관리
                  </Link>
                )}
                <Link
                  to="/me"
                  className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 font-semibold hover:border-brand"
                >
                  {me.avatarUrl ? (
                    <img src={me.avatarUrl} alt="" className="h-5 w-5 rounded-full" />
                  ) : (
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">
                      {me.name.slice(0, 1)}
                    </span>
                  )}
                  {me.name}
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-brand px-4 py-1.5 font-semibold text-white hover:bg-brand-deep"
              >
                로그인
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}
