import { useTranslations } from '../../i18n/index'

export function HomeView() {
  const t = useTranslations()

  return <h1>{t('routing.home')}</h1>
}
