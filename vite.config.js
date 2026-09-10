import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

import { execSync } from "node:child_process";

// Версия сборки. Без неё в отчёте об ошибке нельзя сказать, починена она или
// нет: релиз — единственный способ отличить «баг вернулся» от «старый отчёт».
// На хостинге git может быть недоступен, поэтому сначала смотрим переменные,
// которые подставляет платформа.
const release = (() => {
  if (process.env.VITE_RELEASE) return process.env.VITE_RELEASE;
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
})();

const reporterDefine = {
  "import.meta.env.VITE_RELEASE": JSON.stringify(release),
};

// keepNames: без него минификатор переименовывает компоненты на каждой сборке
// (LessonCard → Ac), и серверный fingerprint перестаёт склеивать одну и ту же
// ошибку между релизами — каждый деплой плодил бы новые issue на ровном месте.
const reporterEsbuild = { keepNames: true };


// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // 'hidden': карты собираются, но ссылка на них в бандл НЕ пишется.
    // Значит браузер их не тянет и исходники наружу не утекают, а у нас
    // они есть — этого достаточно, чтобы разобрать прод-стек в file:line.
    sourcemap: 'hidden',
  },

  define: reporterDefine,
  esbuild: {
    // drop оставлен как был: в проде console.* вырезаются. Репортер на console
    // не полагается ни в одной ветке — он шлёт отчёты по сети.
    drop: ["console", "debugger"],
    ...reporterEsbuild,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 5,
            },
          },
        ],
        navigateFallback: "/index.html",
      },
      manifest: {
        name: "InternHub",
        short_name: "Interns",
        description: "CRM для стажеров Mars IT",
        theme_color: "#6366f1",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/pwa-512x512.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
