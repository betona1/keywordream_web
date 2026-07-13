import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import StoryNew from "./pages/StoryNew";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Support from "./pages/Support";
import { useMe } from "./lib/useMe";

export default function App() {
  const { me, loading, mainUrl, logout } = useMe();

  return (
    <div className="flex min-h-screen flex-col">
      <Header me={me} loading={loading} mainUrl={mainUrl} logout={logout} />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
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
