import { useTranslations } from '@inkink/i18n'

export function ErrorView() {
  const t = useTranslations()

  return <h1>{t('routing.error')}</h1>
}
