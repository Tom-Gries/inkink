import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import type { Db, MongoClient } from 'mongodb'

export interface CreateAuthOptions {
  db: Db
  mongoClient: MongoClient
  baseURL: string
  secret: string
  googleClientId?: string
  googleClientSecret?: string
  trustedOrigins: string[]
  cookieDomain?: string
  /** Log-Level für die Better-Auth-eigene Ausgabe (debug | info | warn | error). */
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
}

/**
 * Normalisiert den Namen, den der Social-Provider liefert (bei Google
 * der vollständige Anzeigename, z. B. "Tom Gries"). Leerzeichen bleiben
 * erhalten – der komplette Name wird als Benutzername hinterlegt.
 */
function nameFromUser(name: string | null | undefined): string | null {
  const fullName = name?.trim()

  return fullName && fullName.length > 0 ? fullName : null
}

/** Server-Logger des Auth-Pakets – konstant mit Präfix [auth:server]. */
function serverLog(message: string, ...details: unknown[]): void {
  console.log(`[auth:server] ${message}`, ...details)
}

function serverWarn(message: string, ...details: unknown[]): void {
  console.warn(`[auth:server] ${message}`, ...details)
}

function serverError(message: string, ...details: unknown[]): void {
  console.error(`[auth:server] ${message}`, ...details)
}

/**
 * Erstellt die Better-Auth-Instanz für eine Hono-API.
 *
 * Bewusst als Factory gebaut, damit die Instanz lazy erzeugt wird
 * (Serverless-freundlich, test-/importierbar ohne gesetzte Env-Variablen).
 *
 * Diagnose: createAuth loggt die wirksame Konfiguration (ohne Secrets),
 * aktiviert das Better-Auth-eigene Logging (Level steuerbar) und macht
 * Auth-API-Fehler über onAPIError zentral sichtbar.
 */
export function createAuth(options: CreateAuthOptions) {
  const { db, mongoClient, baseURL, secret } = options

  const hasGoogleCredentials = Boolean(
    options.googleClientId && options.googleClientSecret,
  )

  const logLevel =
    options.logLevel ??
    (process.env.NODE_ENV === 'production' ? 'warn' : 'debug')

  // TEMPORÄR (Diagnose): Nur bei AUTH_DEBUG=1 zeigt Better Auth OAuth-Fehler
  // auf /api/auth/error statt auf /?error=… (das sonst im Vercel-404 landet).
  const debugEnabled =
    process.env.AUTH_DEBUG === '1' ||
    process.env.AUTH_DEBUG?.toLowerCase() === 'true'

  serverLog(
    `createAuth: baseURL=${baseURL}, secret=${secret ? `gesetzt (${secret.length} Zeichen)` : 'FEHLT'}, google=${hasGoogleCredentials ? 'konfiguriert' : 'FEHLT'}, trustedOrigins=${JSON.stringify(options.trustedOrigins)}, cookieDomain=${options.cookieDomain ?? '(keine)'}, logLevel=${logLevel}`,
  )

  if (!secret) {
    serverWarn(
      'createAuth: BETTER_AUTH_SECRET ist leer – Session-Signierung/-Verifikation wird fehlschlagen!',
    )
  }

  if (!hasGoogleCredentials) {
    serverWarn(
      'createAuth: Google-Credentials fehlen (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) – Google-Login ist nicht möglich!',
    )
  }

  return betterAuth({
    baseURL,
    secret,

    // Better-Auth-eigene Diagnose-Logs einschalten: Die Bibliothek loggt
    // damit selbst jede Entscheidung (Session-Verify, Cookie-Prüfung,
    // CSRF/Origin-Check, OAuth-Redirect, DB-Zugriffe).
    logger: { level: logLevel },

    // Auth-API-Fehler (z. B. INVALID_SESSION, rate limit, DB-Fehler)
    // zentral sichtbar machen. Mit AUTH_DEBUG=1 zusätzlich auf die temporäre
    // Diagnose-Seite /api/auth/error weiterleiten (statt /?error=… → Vercel-404).
    onAPIError: {
      errorURL: debugEnabled ? '/api/auth/error' : undefined,
      onError: (error) => {
        serverError('onAPIError:', error)
      },
    },

    account: {
      storeStateStrategy: 'cookie',
    },

    database: mongodbAdapter(db, {
      client: mongoClient,

      // MongoDB Atlas Free/Shared Cluster (M0) unterstützen keine
      // Multi-Document-Transaktionen – daher deaktiviert. Für Login
      // + Sessions (Einzel-Inserts) nicht benötigt.
      transaction: false,
    }),

    trustedOrigins: options.trustedOrigins,

    socialProviders: hasGoogleCredentials
      ? {
          google: {
            clientId: options.googleClientId!,
            clientSecret: options.googleClientSecret!,
          },
        }
      : {},

    databaseHooks: {
      user: {
        create: {
          // Beim ersten Login (neuer User, z. B. über Google) den
          // vollständigen Namen als Username in der App-eigenen
          // "profile"-Collection hinterlegen. $setOnInsert überschreibt
          // kein vorhandenes Profil.
          after: async (user) => {
            const fullName = nameFromUser(user.name)

            serverLog(
              `databaseHooks.user.create.after: user=${user.id}, name=${fullName ?? '(leer)'}`,
            )

            if (!fullName) {
              return
            }

            try {
              await db
                .collection('profile')
                .updateOne(
                  { userId: user.id },
                  { $setOnInsert: { userId: user.id, username: fullName } },
                  { upsert: true },
                )

              serverLog(
                `databaseHooks.user.create.after: Profil-Upsert OK (user=${user.id}, username=${fullName})`,
              )
            } catch (error) {
              // Profil-Fehler ist kein Grund, den Login fehlschlagen zu
              // lassen – der Nutzer kann den Namen später anpassen.
              serverError(
                `databaseHooks.user.create.after: Profil-Upsert fehlgeschlagen (user=${user.id}) – Login bleibt gültig`,
                error,
              )
            }
          },
        },
      },
    },

    ...(options.cookieDomain
      ? {
          advanced: {
            crossSubDomainCookies: {
              enabled: true,
              domain: options.cookieDomain,
            },
          },
        }
      : {}),
  })
}

export type Auth = ReturnType<typeof createAuth>