import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useLocaleStore, useTranslations } from '../i18n/index'
import { AppShell } from '../ui/index'
import { AuthProvider, LoginButton, useAuthStore } from '../ui-auth/index'

export const Route = createRootRoute({
  component: RootLayout,
})

/**
 * Root-Layout der SPA (kein SSR mehr): AppShell + AuthGate als einziges
 * Gerüst. Provider (QueryClient / I18n) umschließen den Router in main.tsx.
 */
function RootLayout() {
  const user = useAuthStore((state) => state.user)
  const locale = useLocaleStore((state) => state.locale)
  const t = useTranslations()

  // Client-seitig die gespeicherte Sprache laden (nach Mount).
  useEffect(() => {
    useLocaleStore.getState().hydrate()
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const isAuthenticated = user !== null

  return (
    <AppShell
      authenticated={isAuthenticated}
      profile={
        isAuthenticated
          ? {
              name: user?.username ?? user?.name ?? '',
            }
          : undefined
      }
      footer={
        !isAuthenticated ? (
          <LoginButton className="w-full">
            {locale === 'de' ? 'Anmelden' : 'Sign in'}
          </LoginButton>
        ) : undefined
      }
      contentFooter={
        <footer className="shrink-0 border-t border-border px-4 py-4 md:px-8">
          <nav
            className="flex flex-wrap gap-x-6"
            aria-label={t('routing.legalNavigation')}
          >
            <Link
              to="/impressum"
              className="inline-flex min-h-11 items-center rounded-sm text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('routing.imprint')}
            </Link>
            <Link
              to="/datenschutz"
              className="inline-flex min-h-11 items-center rounded-sm text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('routing.privacy')}
            </Link>
          </nav>
        </footer>
      }
    >
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </AppShell>
  )
}
