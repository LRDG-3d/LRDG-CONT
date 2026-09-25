import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANTE: cambia "mi-serie-streaming" por el nombre EXACTO de tu
// repositorio de GitHub. Si tu repo se llama "streaming-la-rosa",
// entonces base debe ser "/streaming-la-rosa/".
// Si vas a usar un dominio propio (CNAME) o publicas en <usuario>.github.io,
// deja base en "/".
export default defineConfig({
  plugins: [react()],
  base: "/LRDG-CONT/",
});
