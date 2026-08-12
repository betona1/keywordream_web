import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Intro from "./components/Intro";
import Home from "./pages/Home";
import Guide from "./pages/Guide";
import Review from "./pages/Review";
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import StoryNew from "./pages/StoryNew";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Support from "./pages/Support";
import { useMe } from "./lib/useMe";

/** 인트로는 홈으로 처음 들어온 세션에만 한 번 재생한다.
 *  게시판 링크를 타고 바로 온 사람에게는 방해가 되므로 홈에서만 띄운다. */
const INTRO_KEY = "logchallenge:intro";
function shouldPlayIntro(): boolean {
  try {
    if (window.location.pathname !== "/") return false;
    if (sessionStorage.getItem(INTRO_KEY)) return false;
    sessionStorage.setItem(INTRO_KEY, "1");
    return true;
  } catch {
    return false; // 프라이빗 모드 등에서 sessionStorage가 막혀 있으면 그냥 건너뛴다
  }
}

export default function App() {
  const { me, loading, mainUrl, logout } = useMe();
  const [intro, setIntro] = useState(shouldPlayIntro);

  return (
    <div className="flex min-h-screen flex-col">
      {intro && <Intro onDone={() => setIntro(false)} />}
      <Header me={me} loading={loading} mainUrl={mainUrl} logout={logout} />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/review" element={<Review />} />
          <Route path="/stories" element={<Stories me={me} loading={loading} mainUrl={mainUrl} />} />
          <Route path="/stories/new" element={<StoryNew me={me} loading={loading} mainUrl={mainUrl} />} />
          <Route path="/stories/:id" element={<StoryDetail me={me} mainUrl={mainUrl} />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/support" element={<Support />} />
          <Route
            path="*"
            element={
              <main className="mx-auto max-w-5xl px-4 py-24 text-center text-muted">
                페이지를 찾을 수 없습니다.
              </main>
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
