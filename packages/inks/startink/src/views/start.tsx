import { authClient, useCreateTestMessage, useMe } from '@inkink/api'
import { useTranslations } from '@inkink/i18n'
import { linkVariants, Link, Page, PageTitle } from '@inkink/ui'

export function StartView() {
  const t = useTranslations()
  const create = useCreateTestMessage()
  const { data: session } = authClient.useSession()
  const me = useMe()

  function handleSend() {
    create.mutate('Test-Nachricht aus startink')
  }

  async function handleGoogleSignIn() {
    await authClient.signIn.social({
      provider: 'google',
      // Absolut auf die Web-App zeigen (lokal: http://localhost:3000,
      // in Produktion: die echte App-Domain). Bei Cross-Origin baut
      // Better Auth den callbackURL sonst auf der API-Base-URL auf.
      callbackURL: window.location.origin,
    })
  }

  async function handleSignOut() {
    await authClient.signOut()
    me.refetch()
  }

  const user = session?.user

  return (
    <Page>
      <PageTitle>{t('startink.start')}</PageTitle>

      <section className="flex flex-col items-center gap-2">
        {user ? (
          <>
            <p>
              {t('startink.loggedInAs')}: {user.name ?? user.email ?? user.id}
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className={linkVariants({ variant: 'outline' })}
            >
              {t('startink.signOut')}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className={linkVariants({ variant: 'default' })}
          >
            {t('startink.signIn')}
          </button>
        )}
        {me.data && (
          <p className="text-sm text-muted-foreground">
            {t('startink.serverSession')}: {me.data.user.email ?? me.data.user.id}
          </p>
        )}
        {me.isError && (
          <p className="text-sm text-muted-foreground">{t('startink.noServerSession')}</p>
        )}
      </section>

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