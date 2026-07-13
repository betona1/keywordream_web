import { useCallback, useEffect, useState } from "react";
import { api, type Me } from "./api";

export function useMe() {
  const [me, setMe] = useState<Me>(null);
  const [loading, setLoading] = useState(true);
  const [mainUrl, setMainUrl] = useState("https://keywordream.com");

  const refresh = useCallback(async () => {
    const res = await api<{ user: Me }>("/api/auth/me");
    setMe(res.ok ? res.data.user : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    void api<{ mainUrl: string }>("/api/config").then((res) => {
      if (res.ok) setMainUrl(res.data.mainUrl);
    });
  }, [refresh]);

  const logout = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" });
    setMe(null);
  }, []);

  return { me, loading, mainUrl, refresh, logout };
}
