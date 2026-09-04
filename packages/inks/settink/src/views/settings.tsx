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
          {/* Account */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="size-4 text-muted-foreground" />
                {t('settink.account')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <SignOutButton className="w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
