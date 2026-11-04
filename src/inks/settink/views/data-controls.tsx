import { Dialog } from '@base-ui-components/react/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Download, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ApiError } from '../../../api/errors'
import { deleteOwnAccount, exportOwnData } from '../../../api/resources/me'
import { useTranslations } from '../../../i18n/index'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  TextField,
} from '../../../ui/index'
import { useAuthStore } from '../../../ui-auth/index'

export function DataControls() {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [needsLogin, setNeedsLogin] = useState(false)

  async function handleExport() {
    setExporting(true)
    setError(null)
    try {
      const data = await exportOwnData()
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = `inkink-data-${new Date().toISOString().slice(0, 10)}.json`
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setError(t('settink.data.exportError'))
    } finally {
      setExporting(false)
    }
  }

  async function handleDelete() {
    if (confirmation !== t('settink.data.confirmWord') || deleting) return
    setDeleting(true)
    setError(null)
    try {
      await deleteOwnAccount()
      await queryClient.cancelQueries()
      queryClient.clear()
      useAuthStore.getState().clear()
      setOpen(false)
      await navigate({ to: '/' })
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === 'RECENT_LOGIN_REQUIRED') {
        setNeedsLogin(true)
        setError(t('settink.data.recentLogin'))
      } else {
        setError(t('settink.data.deleteError'))
      }
    } finally {
      setDeleting(false)
    }
  }

  async function handleLogin() {
    setDeleting(true)
    try {
      await useAuthStore.getState().signOut()
      await queryClient.cancelQueries()
      queryClient.clear()
      await useAuthStore.getState().signInWithGoogle(window.location.href)
    } catch {
      setError(t('settink.data.loginError'))
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settink.data.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-muted-foreground">
          {t('settink.data.description')}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting || deleting}
          >
            <Download className="size-4" />
            {exporting ? t('settink.data.exporting') : t('settink.data.export')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setConfirmation('')
              setError(null)
              setNeedsLogin(false)
              setOpen(true)
            }}
            disabled={exporting || deleting}
          >
            <Trash2 className="size-4" />
            {t('settink.data.delete')}
          </Button>
        </div>
        <a
          className="w-fit text-sm text-primary underline underline-offset-4"
          href="mailto:Kontakt.tomgries@gmail.com?subject=InkInk%20Datenschutzanfrage"
        >
          {t('settink.data.contact')}
        </a>
        {error && !open && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </CardContent>

      <Dialog.Root
        open={open}
        onOpenChange={(next) => {
          if (!deleting) setOpen(next)
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/40" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-lg max-h-[90dvh] overflow-y-auto">
            <Dialog.Title className="text-lg font-semibold">
              {t('settink.data.deleteTitle')}
            </Dialog.Title>
            <Dialog.Description className="my-4 text-sm leading-6 text-muted-foreground">
              {t('settink.data.deleteDescription')}
            </Dialog.Description>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
              className="flex flex-col gap-4"
            >
              <TextField
                label={t('settink.data.confirmLabel')}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="off"
                disabled={deleting || needsLogin}
              />
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={deleting}
                  onClick={() => setOpen(false)}
                >
                  {t('settink.data.cancel')}
                </Button>
                {needsLogin ? (
                  <Button
                    type="button"
                    disabled={deleting}
                    onClick={handleLogin}
                  >
                    {t('settink.data.login')}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={
                      deleting || confirmation !== t('settink.data.confirmWord')
                    }
                  >
                    {deleting
                      ? t('settink.data.deleting')
                      : t('settink.data.deleteConfirm')}
                  </Button>
                )}
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </Card>
  )
}
