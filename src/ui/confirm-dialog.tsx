import { Dialog } from '@base-ui-components/react/dialog'
import type { ReactNode } from 'react'
import { Button } from './button'

export interface ConfirmDialogProps {
  /** Steuert, ob der Dialog sichtbar ist (kontrollierter Dialog). */
  open: boolean
  /** Wird bei jeder Öffnungs-/Schließ-Änderung aufgerufen. */
  onOpenChange: (open: boolean) => void
  /** Überschrift des Dialogs. */
  title: ReactNode
  /** Optionale Beschreibung – z. B. die eigentliche Bestätigungsfrage. */
  description?: ReactNode
  /** Label des Bestätigen-Buttons (lokalisieren). */
  confirmLabel?: string
  /** Label des Abbrechen-Buttons (lokalisieren). */
  cancelLabel?: string
  /** `true` hebt den Bestätigen-Button destruktiv hervor. */
  destructive?: boolean
  /** Wird beim Bestätigen aufgerufen; der Dialog schließt sich danach. */
  onConfirm: () => void
}

/**
 * Wiederverwendbarer Bestätigungsdialog für „Möchtest du das wirklich?"-
 * Abfragen (z. B. Stack archivieren, Prüfung abgeben). Basiert auf dem
 * Base-UI-Dialog, wie ihn die AppShell für das mobile Menü nutzt.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Bestätigen',
  cancelLabel = 'Abbrechen',
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  function handleConfirm() {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-80 max-w-[85vw] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-5 shadow-lg transition-all duration-200 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
          <Dialog.Title className="text-base font-semibold leading-6 tracking-tight text-foreground">
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description className="mt-1.5 text-sm text-muted-foreground">
              {description}
            </Dialog.Description>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={destructive ? 'destructive' : 'default'}
              size="sm"
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
