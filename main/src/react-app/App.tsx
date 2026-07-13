import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyPage from "./pages/MyPage";
import Admin from "./pages/Admin";
import { useMe } from "./lib/useMe";

export default function App() {
  const { me, loading, refresh, logout } = useMe();

  return (
    <div className="flex min-h-screen flex-col">
      <Header me={me} loading={loading} />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login me={me} refresh={refresh} />} />
          <Route
            path="/me"
            element={<MyPage me={me} loading={loading} refresh={refresh} logout={logout} />}
          />
          <Route path="/admin" element={<Admin me={me} loading={loading} />} />
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
