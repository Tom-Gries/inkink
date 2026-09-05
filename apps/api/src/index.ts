import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getAuth } from './auth'
import { getDb } from './db'
import { errorHandler } from './hooks/error-handler'
import {
  authDebugPage,
  computeOAuthStateSummary,
  isAuthDebugEnabled,
  logOAuthCallbackMetadata,
  logOAuthCallbackOutcome,
} from './hooks/auth-debug'
import { realtimeRoutes } from './realtime/sse.routes'
import { meRoutes } from './services/me/me.routes'
import { profileRoutes } from './services/profile/profile.routes'
import { stacksRoutes } from './services/stacks/stacks.routes'
import { testRoutes } from './services/test/test.routes'
import { usersRoutes } from './services/users/users.routes'

const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())

const app = new Hono().basePath('/api')

app.use('*', cors({ origin: corsOrigins, credentials: true }))
app.onError(errorHandler)

const routes = app
  .get('/health', (c) => c.json({ status: 'ok' }))
  .get('/ping', async (c) => {
    try {
      await getDb().command({ ping: 1 })

      return c.json({ mongo: 'up' })
    } catch {
      return c.json({ mongo: 'down' }, 503)
    }
  })
  // TEMPORÄRE Diagnose-Route für state_mismatch (nur mit AUTH_DEBUG=1 aktiv).
  .get('/auth/error', (c) => {
    // Ohne Debug-Flag das ORIGINAL-Verhalten beibehalten: an Better Auth
    // weiterreichen (dessen eigener /error-Endpoint entscheidet selbst).
    if (!isAuthDebugEnabled()) {
      return getAuth().handler(c.req.raw)
    }

    const raw = c.req.raw
    const { html, setCookieTest } = authDebugPage(
      { url: raw.url, headers: raw.headers, method: raw.method },
      () => computeOAuthStateSummary(raw),
    )

    if (setCookieTest) {
      c.header('Set-Cookie', setCookieTest)
    }

    return c.html(html)
  })
  .all('/auth/*', async (c) => {
    const url = new URL(c.req.url)
    const cookieHeader = c.req.raw.headers.get('cookie')
    const origin = c.req.header('origin')
    const isCallback = url.pathname.includes('/callback/')

    console.log(
      `[auth:server] → ${c.req.method} ${url.pathname}${url.search} origin=${origin ?? '(keine)'} cookie=${cookieHeader ? 'ja' : 'nein'}`,
    )

    if (isAuthDebugEnabled() && isCallback) {
      logOAuthCallbackMetadata(c)
    }

    try {
      const res = await getAuth().handler(c.req.raw)

      console.log(
        `[auth:server] ← ${c.req.method} ${url.pathname}${url.search} status=${res.status}`,
      )

      if (isAuthDebugEnabled() && isCallback) {
        logOAuthCallbackOutcome(res)
      }

      return res
    } catch (error) {
      console.error(
        `[auth:server] ✗ ${c.req.method} ${url.pathname}: Fehler im Better-Auth-Handler`,
        error,
      )
      throw error
    }
  })
  .route('/me', meRoutes)
  .route('/profile', profileRoutes)
  .route('/stacks', stacksRoutes)
  .route('/test', testRoutes)
  .route('/users', usersRoutes)
  .route('/realtime', realtimeRoutes)

export type AppType = typeof routes

// ── TEMPORÄR: Root-Level-Wrapper ────────────────────────────────────────────
// Verhindert, dass `/` und `/error` auf der API-Domain (inkink-api.vercel.app)
// im Vercel-404 landen und leitet sie – nur bei AUTH_DEBUG=1 – zur
// Diagnose-Route weiter. Ohne Debug-Flag: Hono-404 wie bisher.
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

export default serverApp
