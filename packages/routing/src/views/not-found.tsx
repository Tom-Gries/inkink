import { useTranslations } from '@inkink/i18n'

export function NotFoundView() {
  const t = useTranslations()

  return <h1>{t('routing.notFound')}</h1>
}
