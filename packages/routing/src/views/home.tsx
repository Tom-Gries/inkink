import { useTranslations } from '@inkink/i18n'

export function HomeView() {
  const t = useTranslations()

  return <h1>{t('routing.home')}</h1>
}
