import { createTranslations, I18nProvider, useLocaleStore } from '@inkink/i18n'
import { translations as routingTranslations } from '@inkink/routing'
import { AppShell } from '@inkink/ui'
import {
  AuthProvider,
  authTranslations,
  LoginButton,
  useAuthStore,
} from '@inkink/ui-auth'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { useEffect } from 'react'

import { inkTranslations } from '../inks'
import appCss from '../styles.css?url'

const translations = createTranslations(
  routingTranslations,
  inkTranslations,
  authTranslations,
)

// Modulweit genau EIN QueryClient (stabil über Render-Zyklen).
const queryClient = new QueryClient()

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'InkInk',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const locale = useLocaleStore((state) => state.locale)

  // Ausgeloggt: Am Platz des Profils (Sidebar-/Drawer-Footer) den
  // Login-Button zeigen; eingeloggt übernimmt AppShell das Standard-Profil.
  const isAuthenticated = user !== null

  return (
    <AppShell
      authenticated={isAuthenticated}
      footer={
        !isAuthenticated ? (
          <LoginButton className="w-full">
            {locale === 'de' ? 'Anmelden' : 'Sign in'}
          </LoginButton>
        ) : undefined
      }
    >
      <AuthProvider>{children}</AuthProvider>
    </AppShell>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((state) => state.locale)

  // Client-seitig die gespeicherte Sprache laden (nach Mount, um
  // SSR-Hydrations-Mismatches zu vermeiden).
  useEffect(() => {
    useLocaleStore.getState().hydrate()
  }, [])

  return (
    <html lang={locale}>
      <head>
        <HeadContent />
      </head>
      <body>
        <I18nProvider locale={locale} translations={translations}>
          <QueryClientProvider client={queryClient}>
            <RootLayout>{children}</RootLayout>
          </QueryClientProvider>
        </I18nProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
