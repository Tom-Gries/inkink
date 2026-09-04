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
 * Normalisiert den Namen, den der Social-Provider liefert (bei Google
 * der vollständige Anzeigename, z. B. "Tom Gries"). Leerzeichen bleiben
 * erhalten – der komplette Name wird als Benutzername hinterlegt.
 */
function nameFromUser(name: string | null | undefined): string | null {
  const fullName = name?.trim()
  return fullName && fullName.length > 0 ? fullName : null
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
    databaseHooks: {
      user: {
        create: {
          // Beim ersten Login (neuer User, z. B. über Google) den
          // vollständigen Namen als Username in der App-eigenen
          // "profile"-Collection hinterlegen. $setOnInsert überschreibt
          // kein vorhandenes Profil.
          after: async (user) => {
            const fullName = nameFromUser(user.name)

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
            } catch {
              // Profil-Fehler ist kein Grund, den Login fehlschlagen zu
              // lassen – der Nutzer kann den Namen später anpassen.
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
