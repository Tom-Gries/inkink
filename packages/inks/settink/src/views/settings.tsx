import { useTranslations } from '@inkink/i18n'
import {
  AvatarControl,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Divider,
  PageContainer,
  PageHeader,
  RadioGroupControl,
  RadioOption,
  SwitchControl,
  TextField,
} from '@inkink/ui'
import { SignOutButton } from '@inkink/ui-auth'
import {
  Check,
  Copy,
  Download,
  KeyRound,
  Mail,
  QrCode,
  User as UserIcon,
} from 'lucide-react'
import { useState } from 'react'

interface ProfileMock {
  name: string
  username: string
  bio: string
  level: number
  xp: number
}

const DEMO_PROFILE: ProfileMock = {
  name: 'Tom Gries',
  username: '@tommylein',
  bio: 'Neugierig unterwegs – überall ein bisschen zu Hause.',
  level: 12,
  xp: 1240,
}

export function SettingsView() {
  const t = useTranslations()
  const [profile, setProfile] = useState<ProfileMock>(DEMO_PROFILE)
  const [visibility, setVisibility] = useState('public')
  const [notifications, setNotifications] = useState({
    connections: true,
    routines: true,
    rewards: true,
    learning: true,
    dailies: true,
    reminders: false,
  })
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(text: string) {
    setToast(text)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault()
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((current) => ({ ...current, [key]: !current[key] }))
  }

  function disableAll() {
    setNotifications({
      connections: false,
      routines: false,
      rewards: false,
      learning: false,
      dailies: false,
      reminders: false,
    })
  }

  function copyProfileLink() {
    void navigator.clipboard?.writeText(
      `https://inkink.example/${profile.username}`,
    )
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const notificationRows: Array<{
    key: keyof typeof notifications
    title: string
    description: string
  }> = [
    {
      key: 'connections',
      title: t('settink.notify.connections'),
      description: t('settink.notify.connectionsDesc'),
    },
    {
      key: 'routines',
      title: t('settink.notify.routines'),
      description: t('settink.notify.routinesDesc'),
    },
    {
      key: 'rewards',
      title: t('settink.notify.rewards'),
      description: t('settink.notify.rewardsDesc'),
    },
    {
      key: 'learning',
      title: t('settink.notify.learning'),
      description: t('settink.notify.learningDesc'),
    },
    {
      key: 'dailies',
      title: t('settink.notify.dailies'),
      description: t('settink.notify.dailiesDesc'),
    },
    {
      key: 'reminders',
      title: t('settink.notify.reminders'),
      description: t('settink.notify.remindersDesc'),
    },
  ]

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
              <div className="flex items-start gap-4">
                <AvatarControl
                  name={profile.name}
                  className="size-16 text-lg"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.username}
                  </p>
                  <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                    <span>
                      {t('settink.sidebar.level')} {profile.level}
                    </span>
                    <span>·</span>
                    <span>
                      {profile.xp.toLocaleString('de-DE')}{' '}
                      {t('settink.sidebar.xp')}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => showToast(t('settink.profileCode.copied'))}
                >
                  {t('settink.profile.avatarChange')}
                </Button>
              </div>

              <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
                <TextField
                  label={t('settink.profile.name')}
                  description={t('settink.profile.nameHint')}
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((p) => ({ ...p, name: event.target.value }))
                  }
                />
                <TextField
                  label={t('settink.profile.username')}
                  description={t('settink.profile.usernameHint')}
                  value={profile.username}
                  onChange={(event) =>
                    setProfile((p) => ({ ...p, username: event.target.value }))
                  }
                />
                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-medium text-foreground"
                    htmlFor="profile-bio"
                  >
                    {t('settink.profile.bio')}
                  </label>
                  <textarea
                    id="profile-bio"
                    className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                    placeholder={t('settink.profile.bioPlaceholder')}
                    value={profile.bio}
                    onChange={(event) =>
                      setProfile((p) => ({ ...p, bio: event.target.value }))
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={saved}>
                    {saved ? <Check className="size-4" /> : null}
                    {saved
                      ? t('settink.profile.saved')
                      : t('settink.profile.save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Sichtbarkeit */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settink.visibility')}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroupControl
                value={visibility}
                onValueChange={(value) => setVisibility(String(value))}
                className="flex flex-col gap-2.5"
              >
                <RadioOption
                  value="public"
                  label={t('settink.visibility.visible')}
                  description={t('settink.visibility.visibleDesc')}
                />
                <RadioOption
                  value="private"
                  label={t('settink.visibility.private')}
                  description={t('settink.visibility.privateDesc')}
                />
              </RadioGroupControl>
            </CardContent>
          </Card>

          {/* Benachrichtigungen */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{t('settink.notifications')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={disableAll}>
                {t('settink.notifications.disableAll')}
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <CardDescription>
                {t('settink.notificationsHint')}
              </CardDescription>
              {notificationRows.map((row) => (
                <div
                  key={row.key}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-medium">{row.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.description}
                    </p>
                  </div>
                  <SwitchControl
                    checked={notifications[row.key]}
                    onCheckedChange={() => toggleNotification(row.key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Rechte Spalte */}
        <div className="flex flex-col gap-6">
          {/* Profil-Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="size-4 text-muted-foreground" />
                {t('settink.profileCode')}
              </CardTitle>
              <CardDescription>{t('settink.profileCodeDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-muted p-4">
                <div className="mx-auto flex aspect-square w-36 items-center justify-center rounded-md bg-white text-foreground">
                  <QrCode className="size-20 text-foreground" />
                </div>
              </div>
              <Button
                className="mt-4 w-full"
                onClick={() => showToast(t('settink.profileCode.download'))}
              >
                <Download className="size-4" />
                {t('settink.profileCode.download')}
              </Button>
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={copyProfileLink}
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied
                  ? t('settink.profileCode.copied')
                  : t('settink.profileCode.copy')}
              </Button>
            </CardContent>
          </Card>

          {/* E-Mail */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                {t('settink.email')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="size-4 text-muted-foreground" />
                {t('settink.email.change')}
              </Button>
            </CardContent>
          </Card>

          {/* Account */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="size-4 text-muted-foreground" />
                {t('settink.account')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" className="w-full justify-start">
                <KeyRound className="size-4 text-muted-foreground" />
                {t('settink.account.password')}
              </Button>
              <Divider />
              <SignOutButton className="w-full" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          <div className="pointer-events-auto flex items-center gap-2 rounded-md bg-neutral-900 px-3 py-2 text-sm text-white shadow-md">
            <Check className="size-4" />
            {toast}
          </div>
        </div>
      )}
    </PageContainer>
  )
}
