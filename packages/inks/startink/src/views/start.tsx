import { useTranslations } from '@inkink/i18n'
import { Link, PageContainer, PageHeader } from '@inkink/ui'

export function StartView() {
  const t = useTranslations()

  return (
    <PageContainer>
      <PageHeader
        title={t('startink.start')}
        description={t('startink.startSubtitle')}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Link to="startink.ziel" type="next">
          {t('startink.ziel')}
        </Link>
        <Link to="startink.einstellungen" variant="outline" type="next">
          {t('startink.einstellungen')}
        </Link>
      </div>
    </PageContainer>
  )
}
