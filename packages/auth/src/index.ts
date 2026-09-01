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
}

/**
 * Erstellt die Better-Auth-Instanz für eine Hono-API.
 * Bewusst als Factory gebaut, damit die Instanz lazy erzeugt wird
 * (Serverless-freundlich, test-/importierbar ohne gesetzte Env-Variablen).
 */
export function createAuth(options: CreateAuthOptions) {
  const { db, mongoClient, baseURL, secret } = options
  const hasGoogleCredentials = Boolean(
    options.googleClientId && options.googleClientSecret,
  )

  return betterAuth({
    baseURL,
    secret,
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
