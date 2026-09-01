import { createAuth, type Auth } from '@inkink/auth'
import { getDb, getMongoClient } from './db'

let auth: Auth | undefined

/** Lazier Singleton der Better-Auth-Instanz (eine DB-Verbindung). */
export function getAuth(): Auth {
  auth ??= createAuth({
    db: getDb(),
    mongoClient: getMongoClient(),
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:8787',
    secret: process.env.BETTER_AUTH_SECRET ?? '',
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    trustedOrigins: (process.env.WEB_ORIGIN ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim()),
    cookieDomain: process.env.COOKIE_DOMAIN,
  })

  return auth
}