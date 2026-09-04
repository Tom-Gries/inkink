/**
 * Schlanker Logger für den Auth-Flow auf der Client-Seite (@inkink/api).
 *
 * Loggt mit dem konstanten Präfix [auth:client], damit die Auth-Spur in
 * der Browser-Konsole (und während des SSR) auf einen Blick erkennbar
 * ist. Über VITE_AUTH_LOG_LEVEL steuerbar:
 *
 *   debug | info | warn | error
 *
 * Standard: debug in der Entwicklung, warn in Produktion, leise in Tests.
 *
 * WICHTIG: Hier werden bewusst KEINE Secrets, Tokens oder Cookie-Inhalte
 * geloggt – nur Metadaten (IDs, URLs, Status, Settings).
 */

export type AuthLogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVELS: readonly AuthLogLevel[] = ['debug', 'info', 'warn', 'error']

function resolveLevel(): AuthLogLevel {
  const raw = import.meta.env.VITE_AUTH_LOG_LEVEL?.toLowerCase()

  if ((LEVELS as readonly string[]).includes(raw ?? '')) {
    return raw as AuthLogLevel
  }

  // In Tests (Vitest) leise halten; in der Entwicklung ausführlich; in
  // Produktion nur Warnungen und Fehler.
  if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
    return 'debug'
  }

  return 'warn'
}

function isEnabled(level: AuthLogLevel): boolean {
  return LEVELS.indexOf(level) >= LEVELS.indexOf(resolveLevel())
}

function formatDetails(details: unknown): string {
  if (details === undefined) {
    return ''
  }

  if (details instanceof Error) {
    return ` – ${details.name}: ${details.message}`
  }

  if (typeof details === 'string') {
    return ` – ${details}`
  }

  try {
    const json = JSON.stringify(details)
    return json !== undefined ? ` – ${json}` : ''
  } catch {
    return ` – ${String(details)}`
  }
}

function write(
  level: AuthLogLevel,
  tag: string,
  message: string,
  details?: unknown,
): void {
  if (!isEnabled(level)) {
    return
  }

  const line = `[auth:client] [${tag}] ${message}${formatDetails(details)}`

  if (level === 'warn') {
    console.warn(line)
  } else if (level === 'error') {
    console.error(line)
  } else {
    console.log(line)
  }
}

/** Ausführliche, optionale Auth-Spur (Standard in der Entwicklung). */
export function authLog(tag: string, message: string, details?: unknown): void {
  write('debug', tag, message, details)
}

export function authInfo(tag: string, message: string, details?: unknown): void {
  write('info', tag, message, details)
}

/** Hinweis auf eine ungewöhnliche/verdächtige Auth-Situation. */
export function authWarn(tag: string, message: string, details?: unknown): void {
  write('warn', tag, message, details)
}

/** Fehler im Auth-Flow – immer sichtbar (außer explizit reduziert). */
export function authError(tag: string, message: string, details?: unknown): void {
  write('error', tag, message, details)
}