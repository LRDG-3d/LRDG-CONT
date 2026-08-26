import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: '/LRDG-CONT/' apunta al nombre del repositorio en GitHub Pages
// (https://<usuario>.github.io/LRDG-CONT/). Si algún día usas un dominio
// propio o publicas en la raíz de un repo user/org (usuario.github.io),
// cambia esto de nuevo a './'.
export default defineConfig({
  plugins: [react()],
  base: '/LRDG-CONT/',
})
