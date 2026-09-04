import { useLocaleStore, useTranslations } from '@inkink/i18n'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageContainer,
  PageHeader,
  RadioGroupControl,
  RadioOption,
  TextField,
} from '@inkink/ui'
import { LoginButton, SignOutButton, useAuthStore } from '@inkink/ui-auth'
import { Check, Languages, Save, User as UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function SettingsView() {
  const t = useTranslations()
  const user = useAuthStore((state) => state.user)
  const updateUsername = useAuthStore((state) => state.updateUsername)
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)

  // Nicht eingeloggt → kein Bearbeitungs-Formular, sondern Login-Button.
  const [username, setUsername] = useState(user?.username ?? '')
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const isAuthenticated = user !== null

  // Feld mit aktuellem Benutzernamen synchronisieren, sobald ein User
  // verfügbar ist (z. B. nach dem Login auf dieser Seite).
  useEffect(() => {
    if (user) {
      setUsername(user.username ?? '')
    }
  }, [user])

  async function handleSaveUsername(event: React.FormEvent) {
    event.preventDefault()
    setStatus('saving')
    setError(null)

    try {
      await updateUsername(username.trim())
      setStatus('saved')
    } catch (error) {
      setStatus('error')
      setError(
        error instanceof Error ? error.message : t('settink.profile.saveError'),
      )
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('settink.settings')}
        description={t('settink.settingsSubtitle')}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Linke Spalte */}
        <div className="flex flex-col gap-6">
          {/* Profil */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settink.profile')}</CardTitle>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">
                    {t('settink.profile.loginPrompt')}
                  </p>
                  <LoginButton className="w-full">
                    {t('auth.login.footer')}
                  </LoginButton>
                </div>
              ) : (
                <form
                  onSubmit={handleSaveUsername}
                  className="flex flex-col gap-4"
                >
                  <TextField
                    label={t('settink.profile.username')}
                    description={t('settink.profile.usernameHint')}
                    value={username}
                    placeholder={user?.username ?? undefined}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                  {status === 'error' && error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button
                    type="submit"
                    variant="default"
                    disabled={status === 'saving'}
                    className="w-fit"
                  >
                    {status === 'saved' ? (
                      <Check className="size-4" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    {status === 'saved'
                      ? t('settink.profile.saved')
                      : t('settink.profile.save')}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Account (nur eingeloggt) */}
          {isAuthenticated && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="size-4 text-muted-foreground" />
                  {t('settink.account')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SignOutButton className="w-full" />
              </CardContent>
            </Card>
          )}

          {/* Sprache */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Languages className="size-4 text-muted-foreground" />
                {t('settink.language')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroupControl
                value={locale}
                onValueChange={(value) => {
                  if (value === 'de' || value === 'en') {
                    setLocale(value)
                  }
                }}
              >
                <RadioOption label={t('settink.language.de')} value="de" />
                <RadioOption label={t('settink.language.en')} value="en" />
              </RadioGroupControl>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
