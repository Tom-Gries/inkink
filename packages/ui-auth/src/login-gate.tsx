import { useTranslations } from '@inkink/i18n'
import { linkVariants, Page, PageTitle } from '@inkink/ui'
import { useAuthStore } from './store'

/**
 * Die Login-UI als eigene Komponente: Zeigt den Google-Login an,
 * wenn eine geschützte Route ohne gültige Session geöffnet wird.
 *
 * Der AuthProvider rendert sie statt des Inhalts – die URL bleibt
 * dabei unverändert. Nach erfolgreicher Anmeldung schließt der
 * Provider das Gate automatisch.
 */
export function LoginGate() {
  const t = useTranslations()
  const status = useAuthStore((state) => state.status)
  const error = useAuthStore((state) => state.error)
  const pendingTarget = useAuthStore((state) => state.pendingTarget)
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle)

  const pending = status === 'idle' || status === 'loading'

  async function handleGoogleSignIn() {
    // Ziel immer ABSOLUT auf den Web-Origin machen: Der Auth-Guard
    // meldet das Ziel als relativen Pfad (location.href), z. B.
    // "/startink/ziel". Ein relativer callbackURL würde Better Auth
    // nach dem OAuth-Callback relativ zur API-Base (localhost:8787)
    // auflösen – der Benutzer landete also nicht auf der Web-App
    // (localhost:3000). new URL() löst relative Pfade gegen den
    // aktuellen Origin auf und lässt absolute Ziel-URLs unverändert.
    const fallback = window.location.pathname + window.location.search
    const target = new URL(
      pendingTarget ?? fallback,
      window.location.origin,
    ).toString()

    await signInWithGoogle(target)
  }

  return (
    <Page>
      <PageTitle>{t('auth.login.title')}</PageTitle>
      <p className="text-muted-foreground">{t('auth.login.subtitle')}</p>

      {pending ? (
        <p className="text-sm text-muted-foreground">
          {t('auth.login.checking')}
        </p>
      ) : (
        <section className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className={linkVariants({ variant: 'default' })}
          >
            {t('auth.login.google')}
          </button>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {t('auth.login.error')}: {error}
            </p>
          )}
        </section>
      )}
    </Page>
  )
}