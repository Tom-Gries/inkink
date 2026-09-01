import { createTestMessage, getApi } from '@inkink/api'
import { useTranslations } from '@inkink/i18n'
import { linkVariants, Link, Page, PageTitle } from '@inkink/ui'
import { useState } from 'react'

export function StartView() {
  const t = useTranslations()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function sendTestMessage() {
    setPending(true)

    try {
      const message = await createTestMessage(getApi(), 'Test-Nachricht aus startink')

      setFeedback(`${t('startink.testSuccess')} (#…${message.id.slice(-6)})`)
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? `${t('startink.testError')}: ${error.message}`
          : t('startink.testError'),
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <Page>
      <PageTitle>{t('startink.start')}</PageTitle>
      <button
        type="button"
        onClick={sendTestMessage}
        disabled={pending}
        className={linkVariants({ variant: 'default' })}
      >
        {pending ? '…' : t('startink.testButton')}
      </button>
      {feedback && <p>{feedback}</p>}
      <Link to="startink.ziel" type="next">
        {t('startink.ziel')}
      </Link>
    </Page>
  )
}