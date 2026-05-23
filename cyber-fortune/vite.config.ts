import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["vite.svg"],
      manifest: {
        name: "浅草缘签",
        short_name: "缘签",
        description: "浅草寺观音灵签 · 赛博参拜体验",
        theme_color: "#b72e2e",
        background_color: "#fdfbf7",
        display: "standalone",
        lang: "zh-CN",
        icons: [
          {
            src: "/vite.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,json,svg,JPEG,jpg,png,webp}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/npm\/@mediapipe\//,
            handler: "CacheFirst",
            options: {
              cacheName: "mediapipe-hands",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
});
