import { useTranslations } from '@inkink/i18n'
import { Link, Page, PageTitle } from '@inkink/ui'

export function StartView() {
  const t = useTranslations()

  return (
    <Page>
      <PageTitle>{t('startink.start')}</PageTitle>
      <Link to="startink.ziel" type="next">
        {t('startink.ziel')}
      </Link>
    </Page>
  )
}