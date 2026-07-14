// 로그인 페이지 — 소셜 간편로그인(구글/카카오/네이버) + 이메일 인증코드(패스워드리스)
// keepup 등에서 ?next=<돌아갈 URL>로 넘어오면 로그인 후 그곳으로 복귀
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../components/Logo";
import Turnstile from "../components/Turnstile";
import { api, type Me } from "../lib/api";

const SOCIAL: Record<string, { label: string; cls: string; icon: string }> = {
  kakao: {
    label: "카카오로 계속하기",
    cls: "bg-[#FEE500] text-[#191919] hover:brightness-95",
    icon: "K",
  },
  google: {
    label: "Google로 계속하기",
    cls: "border border-line bg-card text-ink hover:border-ink",
    icon: "G",
  },
  naver: {
    label: "네이버로 계속하기",
    cls: "bg-[#03C75A] text-white hover:brightness-95",
    icon: "N",
  },
};

export default function Login({ me, refresh }: { me: Me; refresh: () => Promise<void> }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/";
  const loginError = params.get("error");

  const [providers, setProviders] = useState<string[]>([]);
  const [emailLogin, setEmailLogin] = useState(false);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [agree, setAgree] = useState(false); // 개인정보 수집·이용 동의 (필수)

  const requireAgree = (e: React.MouseEvent | React.FormEvent) => {
    if (!agree) {
      e.preventDefault();
      setMsg("개인정보 수집·이용에 동의해 주세요 (필수)");
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (next.startsWith("/")) navigate(next, { replace: true });
    else window.location.href = next; // keepup 서브도메인 복귀
  };

  useEffect(() => {
    void api<{ providers: string[]; emailLogin: boolean }>("/api/auth/providers").then((res) => {
      if (res.ok) {
        setProviders(res.data.providers);
        setEmailLogin(res.data.emailLogin);
      }
    });
    void api<{ turnstileSiteKey: string | null }>("/api/config").then((res) => {
      if (res.ok) setSiteKey(res.data.turnstileSiteKey);
    });
  }, []);

  // 이미 로그인된 경우 복귀
  useEffect(() => {
    if (me) goNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAgree(e)) return;
    if (siteKey && !token) {
      setMsg("스팸 방지 확인을 완료해 주세요.");
      return;
    }
    setBusy(true);
    setMsg("");
    const res = await api("/api/auth/email/start", {
      method: "POST",
      body: JSON.stringify({ email, turnstileToken: token }),
    });
    setBusy(false);
    if (res.ok) {
      setStep("code");
    } else {
      setMsg(
        res.error === "too_many_requests"
          ? "요청이 너무 많습니다. 1시간 후 다시 시도해 주세요."
          : `발송 실패: ${res.error}`,
      );
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const res = await api("/api/auth/email/verify", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    setBusy(false);
    if (res.ok) {
      await refresh();
      goNext();
    } else {
      setMsg(
        res.error === "wrong_code"
          ? "코드가 올바르지 않습니다."
          : res.error === "code_expired"
            ? "코드가 만료됐습니다. 다시 발송해 주세요."
            : `오류: ${res.error}`,
      );
    }
  };

  const input =
    "w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm focus:border-brand focus:outline-none";

  const nextQuery = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-[2rem] border border-line bg-card p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Link to="/">
            <Logo size={48} wordmark={false} />
          </Link>
        </div>
        <h1 className="text-center text-2xl font-extrabold tracking-tight">간편 로그인</h1>
        <p className="mt-2 text-center text-sm text-muted">
          로그인하고 KeepUp 성과 게시판에 63일의 기록을 자랑해 보세요.
        </p>

        {loginError && (
          <p className="mt-4 rounded-xl bg-stamp/10 px-4 py-3 text-center text-sm font-semibold text-stamp">
            로그인에 실패했습니다. 다시 시도해 주세요.
          </p>
        )}

        {providers.length === 0 && !emailLogin && (
          <p className="mt-6 rounded-xl bg-paper px-4 py-3 text-center text-xs text-muted">
            아직 로그인 제공자가 설정되지 않았습니다. (SETUP.md 3단계 — OAuth 앱 등록)
          </p>
        )}

        {/* 개인정보 수집·이용 동의 (필수) — 가입 시점 명시적 동의 */}
        <label className="mt-6 flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-paper px-4 py-3">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => {
              setAgree(e.target.checked);
              if (e.target.checked) setMsg("");
            }}
            className="mt-0.5 h-4 w-4 accent-brand"
          />
          <span className="text-xs leading-relaxed text-muted">
            <b className="text-ink">[필수]</b> 회원 식별 정보(닉네임·프로필·이메일)의 수집·이용에
            동의합니다.{" "}
            <a
              href="https://keepup.keywordream.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-ink"
            >
              개인정보처리방침 보기
            </a>
          </span>
        </label>

        <div className="mt-4 space-y-2.5">
          {providers.map((p) => {
            const s = SOCIAL[p];
            if (!s) return null;
            return (
              <a
                key={p}
                href={`/api/auth/${p}/start${nextQuery}`}
                onClick={requireAgree}
                className={`flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition ${s.cls} ${
                  agree ? "" : "opacity-45"
                }`}
              >
                <span className="grid h-5 w-5 place-items-center rounded text-[10px] font-extrabold">
                  {s.icon}
                </span>
                {s.label}
              </a>
            );
          })}
        </div>

        {emailLogin && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-line" />
              또는 이메일로
              <span className="h-px flex-1 bg-line" />
            </div>

            {step === "email" ? (
              <form onSubmit={sendCode} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="이메일 주소"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={input}
                />
                {siteKey && <Turnstile siteKey={siteKey} onToken={setToken} />}
                <button
                  disabled={busy}
                  className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-50"
                >
                  {busy ? "발송 중…" : "인증코드 받기"}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyCode} className="space-y-3">
                <p className="text-center text-xs text-muted">
                  <b className="text-ink">{email}</b> 로 보낸 6자리 코드를 입력하세요.
                </p>
                <input
                  inputMode="numeric"
                  pattern="\d{6}"
                  required
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className={`${input} text-center text-lg font-bold tracking-[0.5em]`}
                />
                <button
                  disabled={busy || code.length !== 6}
                  className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-50"
                >
                  {busy ? "확인 중…" : "로그인"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setMsg("");
                  }}
                  className="w-full text-center text-xs text-muted hover:text-ink"
                >
                  ← 이메일 다시 입력
                </button>
              </form>
            )}
          </>
        )}

        {msg && <p className="mt-4 text-center text-sm font-semibold text-stamp">{msg}</p>}
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        로그인하면{" "}
        <a href="https://keepup.keywordream.com/terms" className="underline hover:text-ink">
          이용약관
        </a>
        과{" "}
        <a href="https://keepup.keywordream.com/privacy" className="underline hover:text-ink">
          개인정보처리방침
        </a>
        에 동의한 것으로 봅니다.
      </p>
    </main>
  );
}
