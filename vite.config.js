import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// IMPORTANTE: "base" debe coincidir con el nombre EXACTO de tu
// repositorio de GitHub. Si tu repo se llama "LRDG-CONT",
// entonces base debe ser "/LRDG-CONT/".
export default defineConfig({
  base: "/LRDG-CONT/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png"],
      workbox: {
        // evita minificar el service worker con terser (falla en Termux)
        mode: "development",
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
