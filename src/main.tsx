import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createTranslations, I18nProvider, useLocaleStore } from './i18n/index'
import { inkTranslations } from './inks'
import { getRouter } from './router'
import { translations as routingTranslations } from './routing/index'
import { authTranslations } from './ui-auth/index'

import './styles.css'

const translations = createTranslations(
  routingTranslations,
  inkTranslations,
  authTranslations,
)

// Modulweit genau EIN QueryClient (stabil über Render-Zyklen).
const queryClient = new QueryClient()

const router = getRouter()

// Gespeicherte Sprache bereits VOR dem ersten Render aus dem localStorage
// übernehmen (client-seitig, verhindert Flackern beim Sprachwechsel).
useLocaleStore.getState().hydrate()

function App() {
  const locale = useLocaleStore((state) => state.locale)

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider locale={locale} translations={translations}>
        <RouterProvider router={router} />
      </I18nProvider>
    </QueryClientProvider>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root-Element (#root) fehlt in index.html')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
