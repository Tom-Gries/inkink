import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/**
 * Vite-Config für die SPA (src/) im WEB-Projekt (web/).
 * Die Hono-API liegt im API-Projekt unter api/index.ts (Vercel-Function)
 * und wird über vercel.json-Rewrites unter denselben /api/*-Pfaden bedient.
 *
 * Lokale Alternative ohne Vercel CLI: `pnpm dev` im API-Projekt (Port 8787)
 * starten; der Proxy leitet /api/* im Dev-Server an sie weiter.
 */
export default defineConfig({
  plugins: [tailwindcss(), viteReact()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
