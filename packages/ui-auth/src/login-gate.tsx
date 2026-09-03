import { useTranslations } from '@inkink/i18n'
import { Page, PageTitle } from '@inkink/ui'
import { LoginButton } from './login-button'
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

  const pending = status === 'idle' || status === 'loading'

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
          <LoginButton />
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
