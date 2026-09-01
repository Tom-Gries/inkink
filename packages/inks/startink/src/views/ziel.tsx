import { useTranslations } from '@inkink/i18n'
import { Link, Page, PageTitle } from '@inkink/ui'

export function ZielView() {
  const t = useTranslations()

  return (
    <Page>
      <PageTitle>{t('startink.ziel')}</PageTitle>
      <Link to="startink.start" variant="outline" type="back">
        {t('startink.start')}
      </Link>
    </Page>
  )
}