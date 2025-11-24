import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Permite acceder desde Docker (0.0.0.0)
    host: true,
    port: 5173,
    strictPort: true,
    // HMR confiable dentro de contenedores
    hmr: {
      clientPort: Number(process.env.VITE_HMR_CLIENT_PORT || 5173),
      protocol: 'ws',
      host: process.env.VITE_HMR_HOST || 'localhost',
    },
    watch: {
      // Útil para montajes en Windows/WSL/Docker Desktop
      usePolling: true,
      interval: 100,
    },
  },
})
