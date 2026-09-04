import { createAuth, type Auth } from '@inkink/auth'
import { getDb, getMongoClient } from './db'

let auth: Auth | undefined

/** Wandelt eine Env-Variable in einen Log-Hinweis um (Wert wird nie geloggt). */
function envState(value: string | undefined, name: string): string {
  return value ? `${name}=gesetzt` : `${name}=FEHLT`
}

/** Lazier Singleton der Better-Auth-Instanz (eine DB-Verbindung). */
export function getAuth(): Auth {
  if (!auth) {
    const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:8787'
    const secret = process.env.BETTER_AUTH_SECRET ?? ''
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
    const trustedOrigins = (process.env.WEB_ORIGIN ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
    const cookieDomain = process.env.COOKIE_DOMAIN
    const logLevel = process.env.AUTH_LOG_LEVEL as
      | 'debug'
      | 'info'
      | 'warn'
      | 'error'
      | undefined

    console.log('[auth:server] getAuth(): Erstelle Better-Auth-Instanz (lazy Singleton)')
    console.log(`[auth:server] getAuth(): BETTER_AUTH_URL=${baseURL}`)
    console.log(
      `[auth:server] getAuth(): BETTER_AUTH_SECRET=${secret ? `gesetzt (${secret.length} Zeichen)` : 'FEHLT'}`,
    )
    console.log(`[auth:server] getAuth(): ${envState(googleClientId, 'GOOGLE_CLIENT_ID')}`)
    console.log(
      `[auth:server] getAuth(): ${envState(googleClientSecret, 'GOOGLE_CLIENT_SECRET')}`,
    )
    console.log(
      `[auth:server] getAuth(): WEB_ORIGIN (trustedOrigins)=${JSON.stringify(trustedOrigins)}`,
    )
    console.log(`[auth:server] getAuth(): COOKIE_DOMAIN=${cookieDomain ?? '(keine)'}`)
    console.log(
      `[auth:server] getAuth(): AUTH_LOG_LEVEL=${logLevel ?? '(Standard laut NODE_ENV)'}`,
    )

    if (!secret) {
      console.warn(
        '[auth:server] getAuth(): BETTER_AUTH_SECRET ist nicht gesetzt – Auth wird fehlschlagen!',
      )
    }

    if (!googleClientId || !googleClientSecret) {
      console.warn(
        '[auth:server] getAuth(): Google-Credentials fehlen – Google-Login wird nicht funktionieren!',
      )
    }

    auth = createAuth({
      db: getDb(),
      mongoClient: getMongoClient(),
      baseURL,
      secret,
      googleClientId,
      googleClientSecret,
      trustedOrigins,
      cookieDomain,
      logLevel,
    })
  }

  return auth
}