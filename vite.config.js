import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/LRDG-CONT/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png"],
      workbox: {
        mode: "development", // evita minificar el SW con terser (falla en Termux)
      },
      manifest: {
        name: "La Rosa de Guadalupe",
        short_name: "LRDG TV",
        start_url: "/LRDG-CONT/",
        display: "standalone",
        background_color: "#0c0a0d",
        theme_color: "#0c0a0d",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
});
