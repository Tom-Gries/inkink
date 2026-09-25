import { useTranslations } from '../../i18n/index'

export function ErrorView() {
  const t = useTranslations()

  return <h1>{t('routing.error')}</h1>
}
