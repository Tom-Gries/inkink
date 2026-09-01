import { useCreateTestMessage } from '@inkink/api'
import { useTranslations } from '@inkink/i18n'
import { linkVariants, Link, Page, PageTitle } from '@inkink/ui'

export function StartView() {
  const t = useTranslations()
  const create = useCreateTestMessage()

  function handleSend() {
    create.mutate('Test-Nachricht aus startink')
  }

  return (
    <Page>
      <PageTitle>{t('startink.start')}</PageTitle>
      <button
        type="button"
        onClick={handleSend}
        disabled={create.isPending}
        className={linkVariants({ variant: 'default' })}
      >
        {create.isPending ? '…' : t('startink.testButton')}
      </button>
      {create.isSuccess && (
        <p className="text-green-700 dark:text-green-400">
          {t('startink.testSuccess')} (#…{create.data.id.slice(-6)})
        </p>
      )}
      {create.isError && (
        <p className="text-red-600 dark:text-red-400">
          {t('startink.testError')}:{' '}
          {create.error instanceof Error ? create.error.message : ''}
        </p>
      )}
      <Link to="startink.ziel" type="next">
        {t('startink.ziel')}
      </Link>
    </Page>
  )
}