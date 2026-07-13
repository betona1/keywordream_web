import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // 로컬 D1/KV 상태를 main 프로젝트와 공유 → localhost에서 SSO(세션 쿠키) 테스트 가능
    cloudflare({ persistState: { path: "../.dev-state" } }),
  ],
  server: { port: 5174 }, // main(5173)과 동시 실행용
});
