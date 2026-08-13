import { Link } from "react-router-dom";
import Logo from "./Logo";
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
        <Link to="/" aria-label="로그챌린지 (Log Challenge) 홈">
          <Logo size={30} />
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/guide" className="hidden font-semibold text-muted hover:text-ink sm:block">
            사용 가이드
          </Link>
          <Link to="/stories" className="font-semibold text-muted hover:text-ink">
            성과 게시판
          </Link>
          {me && (
            <Link to="/records" className="font-semibold text-muted hover:text-ink">
              내 기록
            </Link>
          )}
          <Link to="/feedback" className="hidden font-semibold text-muted hover:text-ink sm:block">
            개선사항
          </Link>
          <Link
            to="/beta"
            className="font-semibold text-stamp hover:text-stamp-accent"
            title="베타테스터 모집"
          >
            베타 모집
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
