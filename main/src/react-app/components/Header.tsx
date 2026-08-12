import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo";
import type { Me } from "../lib/api";

export default function Header({ me, loading }: { me: Me; loading: boolean }) {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // 홈 최상단은 다크 히어로 위 — 헤더를 투명하게 얹고, 스크롤하면 흰 헤더로 되돌린다
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 홈은 헤더를 히어로 위에 겹쳐 띄운다(-mb-14). 마진은 스크롤과 무관하게 고정해야 점프가 없다.
  const overlay = pathname === "/";
  const onNight = overlay && !scrolled;

  return (
    <header
      className={`sticky top-0 z-30 transition-colors duration-300 ${overlay ? "-mb-14" : ""} ${
        onNight
          ? "border-b border-transparent bg-transparent text-white"
          : "border-b border-line bg-card/90 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" aria-label="keywordream 홈">
          <Logo size={28} light={onNight} />
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <a
            href="https://keepup.keywordream.com"
            className={
              onNight ? "font-semibold text-white/70 hover:text-white" : "font-semibold text-muted hover:text-ink"
            }
          >
            KeepUp
          </a>
          {!loading &&
            (me ? (
              <>
                {me.role === "admin" && (
                  <Link
                    to="/admin"
                    className={
                      onNight
                        ? "font-semibold text-white/70 hover:text-white"
                        : "font-semibold text-muted hover:text-ink"
                    }
                  >
                    관리
                  </Link>
                )}
                <Link
                  to="/me"
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-semibold ${
                    onNight ? "border-white/25 hover:border-neon" : "border-line hover:border-brand"
                  }`}
                >
                  {me.avatarUrl ? (
                    <img src={me.avatarUrl} alt="" className="h-5 w-5 rounded-full" />
                  ) : (
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${
                        onNight ? "bg-neon text-night" : "bg-brand text-white"
                      }`}
                    >
                      {me.name.slice(0, 1)}
                    </span>
                  )}
                  {me.name}
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className={`rounded-full px-4 py-1.5 font-semibold ${
                  onNight
                    ? "bg-neon text-night hover:brightness-110"
                    : "bg-brand text-white hover:bg-brand-deep"
                }`}
              >
                로그인
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}
