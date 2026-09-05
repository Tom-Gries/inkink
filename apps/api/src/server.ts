import { Hono } from 'hono'
import { isAuthDebugEnabled } from './hooks/auth-debug'
import app from './index'

/**
 * Root-Level-Wrapper (nur für Vercel).
 *
 * Verhindert, dass `/` und `/error` auf der API-Domain (inkink-api.vercel.app)
 * im Vercel-404 landen und leitet sie – nur bei AUTH_DEBUG=1 – zur
 * Diagnose-Route weiter. Ohne Debug-Flag: Hono-404 wie bisher.
 */
const serverApp = new Hono()

serverApp.get('/', (c) => {
  if (!isAuthDebugEnabled()) {
    return c.notFound()
  }
  const query = new URL(c.req.url).search
  return c.redirect(`/api/auth/error${query}`, 302)
})

serverApp.get('/error', (c) => {
  if (!isAuthDebugEnabled()) {
    return c.notFound()
  }
  const query = new URL(c.req.url).search
  return c.redirect(`/api/auth/error${query}`, 302)
})

// Alle weiteren Pfade (inkl. /api/*) an die Hono-API mit basePath('/api')
// weiterreichen – ohne Pfad-Rewrite, damit die bestehende App unverändert routet.
serverApp.all('*', (c) => app.fetch(c.req.raw))

/** Handler für Node/Vercel (Framework-Standard). */
export const handler = serverApp.fetch

export default serverApp
