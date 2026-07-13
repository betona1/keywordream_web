import { Link } from "react-router-dom";
import Stamp from "./Stamp";
import { loginUrl, type Me } from "../lib/api";

export default function Header({
  me,
  loading,
  mainUrl,
  logout,
}: {
  me: Me;
  loading: boolean;
  mainUrl: string;
  logout: () => Promise<void>;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="KeepUp 홈">
          <Stamp size={30} label="UP!" />
          <span className="text-lg font-extrabold tracking-tight">
            Keep<span className="text-brand">Up</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/stories" className="font-semibold text-muted hover:text-ink">
            성과 게시판
          </Link>
          <Link to="/support" className="hidden font-semibold text-muted hover:text-ink sm:block">
            문의
          </Link>
          {!loading &&
            (me ? (
              <span className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                  {me.avatarUrl ? (
                    <img src={me.avatarUrl} alt="" className="h-5 w-5 rounded-full" />
                  ) : (
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">
                      {me.name.slice(0, 1)}
                    </span>
                  )}
                  {me.name}
                </span>
                <button
                  onClick={() => void logout()}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:border-ink hover:text-ink"
                >
                  로그아웃
                </button>
              </span>
            ) : (
              <a
                href={loginUrl(mainUrl)}
                className="rounded-full bg-brand px-4 py-1.5 font-semibold text-white hover:bg-brand-deep"
              >
                로그인
              </a>
            ))}
        </nav>
      </div>
    </header>
  );
}
