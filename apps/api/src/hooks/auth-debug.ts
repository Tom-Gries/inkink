/**
 * TEMPORÄRE OAuth-Diagnose für den state_mismatch-Fehler auf Vercel.
 *
 * Sicherheitsregeln (bewusst streng):
 *  - NIEMALS OAuth-Codes, Access-/Refresh-Tokens oder den `state` selbst ausgeben.
 *  - NIEMALS vollständige Cookie-Werte ausgeben – nur Name, vorhanden ja/nein,
 *    Länge und SHA-256-Hash.
 *  - NIEMALS Secrets aus Env-Variablen anzeigen (nur: gesetzt ja/nein / Länge).
 *  - NIEMALS IP-Adressen ausgeben (Vercel-Header nur „vorhanden ja/nein“).
 *
 * Schutz: Die Diagnose ist NUR aktiv, wenn die Env-Variable AUTH_DEBUG=1
 * gesetzt ist. Ohne Flag verhält sich die App exakt wie vorher.
 */

import type { Context } from 'hono'
import { createHash } from 'node:crypto'
import { getAuth } from '../auth'

const OAUTH_STATE_COOKIE_NAMES = [
  '__Secure-better-auth.oauth_state',
  'better-auth.oauth_state',
]

const OAUTH_OTHER_COOKIE_NAMES = [
  '__Secure-better-auth.session_token',
  'better-auth.session_token',
  '__Secure-better-auth.session_data',
  'better-auth.session_data',
  '__Secure-better-auth.account_data',
  'better-auth.account_data',
  '__Secure-better-auth.dont_remember',
  'better-auth.dont_remember',
]

/** Nur in Development/Debug aktiv – sonst verhält sich die App unverändert. */
export function isAuthDebugEnabled(): boolean {
  return (
    process.env.AUTH_DEBUG === '1' ||
    process.env.AUTH_DEBUG?.toLowerCase() === 'true'
  )
}

function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function parseCookies(header: string | null): Map<string, string> {
  const map = new Map<string, string>()
  if (!header) return map
  for (const part of header.split(';')) {
    const eq = part.indexOf('=')
    if (eq < 0) continue
    const name = part.slice(0, eq).trim()
    const value = part.slice(eq + 1).trim()
    if (name) map.set(name, decodeURIComponent(value))
  }
  return map
}

function cookieSummary(
  cookieMap: Map<string, string>,
  name: string,
): { name: string; present: boolean; length: number; sha256: string } {
  const value = cookieMap.get(name)
  return {
    name,
    present: value !== undefined,
    length: value?.length ?? 0,
    sha256: value ? sha256Hex(value) : '',
  }
}

function safeHeaderPresence(
  headers: Headers,
  name: string,
): { name: string; present: boolean } {
  return { name, present: headers.has(name) }
}

/** Für die Diagnose relevante Vercel-/Forward-Header – nur „vorhanden ja/nein“. */
const DIAG_HEADERS = [
  'x-vercel-id',
  'x-vercel-forwarded-for',
  'x-forwarded-for',
  'x-forwarded-proto',
  'x-forwarded-host',
]

function buildCookieReport(
  cookieHeader: string | null,
): Array<{ name: string; present: boolean; length: number; sha256: string }> {
  const cookieMap = parseCookies(cookieHeader)
  const names = [...OAUTH_STATE_COOKIE_NAMES, ...OAUTH_OTHER_COOKIE_NAMES]
  const report = names.map((name) => cookieSummary(cookieMap, name))
  for (const name of cookieMap.keys()) {
    if (!names.includes(name)) {
      report.push({ name, present: true, length: 0, sha256: '' })
    }
  }
  return report
}
interface AuthDebugConfig {
  baseURL: string
  cookiePrefix: string
  useSecureCookies: boolean
  sameSite: string
  path: string
  httpOnly: boolean
  crossSubDomainCookiesEnabled: boolean
  crossSubDomainCookiesDomain: string | null
  cookieDomainEnvSet: boolean
}

/** Liest die tatsächlich wirksame Cookie-Konfiguration aus der Better-Auth-Instanz (getAuth().options) – OHNE Secrets/Token-Werte. */
export function getAuthDebugConfig(): AuthDebugConfig {

  let baseURL = '(nicht initialisiert)'
  let cookiePrefix = 'better-auth'
  let useSecureCookies = false
  let sameSite = 'lax'
  let path = '/'
  let httpOnly = true
  let crossSubDomainCookiesEnabled = false
  let crossSubDomainCookiesDomain: string | null = null

  try {
    const auth = getAuth()
    const opts = (auth as unknown as { options?: Record<string, unknown> })
      .options as
      | {
          baseURL?: string
          advanced?: {
            cookiePrefix?: string
            useSecureCookies?: boolean
            crossSubDomainCookies?: {
              enabled?: boolean
              domain?: string
            }
            defaultCookieAttributes?: {
              sameSite?: string
              path?: string
              httpOnly?: boolean
            }
            cookies?: Record<
              string,
              { attributes?: { sameSite?: string; path?: string; httpOnly?: boolean } }
            >
          }
        }
      | undefined

    if (opts?.baseURL) baseURL = opts.baseURL
    cookiePrefix = opts?.advanced?.cookiePrefix ?? 'better-auth'
    useSecureCookies =
      opts?.advanced?.useSecureCookies ?? /^https:\/\//.test(baseURL)
    sameSite =
      opts?.advanced?.defaultCookieAttributes?.sameSite ??
      opts?.advanced?.cookies?.['oauth_state']?.attributes?.sameSite ??
      'lax'
    path =
      opts?.advanced?.defaultCookieAttributes?.path ??
      opts?.advanced?.cookies?.['oauth_state']?.attributes?.path ??
      '/'
    httpOnly =
      opts?.advanced?.defaultCookieAttributes?.httpOnly ??
      opts?.advanced?.cookies?.['oauth_state']?.attributes?.httpOnly ??
      true
    crossSubDomainCookiesEnabled =
      opts?.advanced?.crossSubDomainCookies?.enabled ?? false
    crossSubDomainCookiesDomain =
      opts?.advanced?.crossSubDomainCookies?.domain ?? null
  } catch {
    // getAuth() kann ohne DB/Env werfen – die Diagnose bleibt trotzdem lesbar.
  }

  return {
    baseURL,
    cookiePrefix,
    useSecureCookies,
    sameSite,
    path,
    httpOnly,
    crossSubDomainCookiesEnabled,
    crossSubDomainCookiesDomain,
    cookieDomainEnvSet: Boolean(process.env.COOKIE_DOMAIN),
  }
}

/** Serverseitige Metadaten-Logik für jeden OAuth-Callback (ohne Secrets). */
export function logOAuthCallbackMetadata(c: Context): void {
  const url = new URL(c.req.url)
  const state = url.searchParams.get('state')
  const cookieHeader = c.req.raw.headers.get('cookie')
  const cookieMap = parseCookies(cookieHeader)

  console.log('[auth:debug] OAuth-Callback empfangen (Metadaten):')
  console.log(
    `  state_in_query=${state ? 'ja' : 'nein'} state_len=${state?.length ?? 0} state_sha256=${state ? sha256Hex(state) : '(kein)'}`,
  )
  for (const name of OAUTH_STATE_COOKIE_NAMES) {
    const sum = cookieSummary(cookieMap, name)
    console.log(
      `  cookie_${sum.name} vorhanden=${sum.present ? 'ja' : 'nein'} len=${sum.length} sha256=${sum.sha256 || '(kein)'}`,
    )
  }
  const origin = c.req.header('origin')
  const referer = c.req.header('referer')
  console.log(`  origin=${origin ?? '(keine)'} referer=${referer ?? '(keine)'}`)
  console.log(
    `  x_vercel_id_present=${c.req.raw.headers.has('x-vercel-id') ? 'ja' : 'nein'}`,
  )
}

export function logOAuthCallbackOutcome(res: Response): void {
  const location = res.headers.get('location')
  let errorCode = '(keiner / kein Redirect)'
  if (location) {
    try {
      errorCode = new URL(location).searchParams.get('error') ?? errorCode
    } catch {
      errorCode = '(Location nicht parsebar)'
    }
  }
  console.log(
    `[auth:debug] OAuth-Callback → status=${res.status} error_code=${errorCode} (aus Location)`,
  )
}

/** Vergleich „gespeicherter State (Cookie) vs. zurückgegebener State (Query)". */
export function computeOAuthStateSummary(req: {
  url: string
  headers: Headers
}): {
  storedStatePresent: boolean
  storedStateLength: number
  returnedStatePresent: boolean
  returnedStateLength: number
} {
  const stateParam = new URL(req.url).searchParams.get('state')
  const cookieMap = parseCookies(req.headers.get('cookie'))

  let storedPresent = false
  let storedLength = 0
  for (const name of OAUTH_STATE_COOKIE_NAMES) {
    const value = cookieMap.get(name)
    if (value !== undefined) {
      storedPresent = true
      storedLength = value.length
      break
    }
  }

  return {
    storedStatePresent: storedPresent,
    storedStateLength: storedLength,
    returnedStatePresent: stateParam !== null,
    returnedStateLength: stateParam?.length ?? 0,
  }
}
/**
 * Diagnose-HTML-Seite. Zeigt NIE geheime Werte – nur Hashes/Längen/
 * vorhanden-Statüs.
 */
export function authDebugPage(
  req: { url: string; headers: Headers; method: string },
  getStateSummary: () => {
    storedStatePresent: boolean
    storedStateLength: number
    returnedStatePresent: boolean
    returnedStateLength: number
  },
): { html: string; setCookieTest?: string } {
  const url = new URL(req.url)
  const params = url.searchParams
  const cookieHeader = req.headers.get('cookie')

  // Aktion „Test-Cookie setzen": setzt einen Nonce-Cookie mit denselben
  // Attributen wie der echte oauth_state (Secure wenn https, SameSite Lax,
  // HttpOnly) – zeigt, ob der Browser Cookies auf dieser Domain behält.
  let setCookieTest: string | undefined
  if (params.get('action') === 'set-cookie-test') {
    const nonce = createHash('sha256')
      .update(`${Date.now()}:${Math.random()}`)
      .digest('hex')
    setCookieTest = `inkink_debug_nonce=${nonce}; Path=/; Max-Age=900; SameSite=Lax; HttpOnly`
    if (req.url.startsWith('https://')) {
      setCookieTest += '; Secure'
    }
  }

  const cookies = buildCookieReport(cookieHeader)
  const error = escapeHtml(params.get('error') ?? '')
  const errorDesc = escapeHtml(params.get('error_description') ?? '')
  const st = getStateSummary()
  const cookieConfig = getAuthDebugConfig()

  const cookieRows = cookies
    .map(
      (cookie) => `<tr>
        <td>${escapeHtml(cookie.name)}</td>
        <td>${cookie.present ? 'ja' : 'nein'}</td>
        <td>${cookie.length}</td>
        <td>${cookie.sha256 ? `<code>${escapeHtml(cookie.sha256.slice(0, 16))}…</code>` : '—'}</td>
      </tr>`,
    )
    .join('\n')

  const queryRows = Array.from(params.entries())
    .map(([key, value]) => {
      if (key === 'state') {
        return `<tr><td>state</td><td colspan="3">vorhanden: <strong>ja</strong> – Länge ${value.length}, sha256 ${escapeHtml(sha256Hex(value).slice(0, 16))}… <em>(Wert wird nie angezeigt)</em></td></tr>`
      }
      if (key === 'code') {
        return `<tr><td>code</td><td colspan="3">vorhanden: <strong>ja</strong> (Wert wird nie angezeigt)</td></tr>`
      }
      const safe = escapeHtml(value)
      return `<tr><td>${escapeHtml(key)}</td><td colspan="3">${safe ? `<code>${safe}</code>` : '(leer)'}</td></tr>`
    })
    .join('\n')

  const headerRows = DIAG_HEADERS.map((h) =>
    safeHeaderPresence(req.headers, h),
  )
    .map(
      (h) =>
        `<tr><td>${escapeHtml(h.name)}</td><td>${h.present ? 'ja' : 'nein'}</td></tr>`,
    )
    .join('\n')

  const configRows = `
    <tr><td>baseURL</td><td>${escapeHtml(cookieConfig.baseURL)}</td></tr>
    <tr><td>cookiePrefix</td><td>${escapeHtml(cookieConfig.cookiePrefix)}</td></tr>
    <tr><td>useSecureCookies (Secure-Cookie)</td><td>${cookieConfig.useSecureCookies ? 'ja' : 'nein'}</td></tr>
    <tr><td>sameSite</td><td>${escapeHtml(cookieConfig.sameSite)}</td></tr>
    <tr><td>path</td><td>${escapeHtml(cookieConfig.path)}</td></tr>
    <tr><td>httpOnly</td><td>${cookieConfig.httpOnly ? 'ja' : 'nein'}</td></tr>
    <tr><td>crossSubDomainCookies.enabled</td><td>${cookieConfig.crossSubDomainCookiesEnabled ? 'ja' : 'nein'}</td></tr>
    <tr><td>crossSubDomainCookies.domain</td><td>${cookieConfig.crossSubDomainCookiesDomain ? escapeHtml(cookieConfig.crossSubDomainCookiesDomain) : '(nicht gesetzt)'}</td></tr>
    <tr><td>COOKIE_DOMAIN (Env)</td><td>${cookieConfig.cookieDomainEnvSet ? 'ja (gesetzt)' : 'nein (nicht gesetzt)'}</td></tr>
  `

  const stateVergleich = `<tr>
    <td>Gespeichert (Cookie <code>${escapeHtml(OAUTH_STATE_COOKIE_NAMES[0])}</code>)</td>
    <td>${st.storedStatePresent ? 'ja' : 'nein'}</td>
    <td>${st.storedStateLength}</td>
  </tr>
  <tr>
    <td>Zurückgegeben (Query <code>state</code>)</td>
    <td>${st.returnedStatePresent ? 'ja' : 'nein'}</td>
    <td>${st.returnedStateLength}</td>
  </tr>
  <tr>
    <td colspan="3"><small>Hinweis: Der Cookie enthält den State <strong>verschlüsselt</strong>.
    Ein direkter Hash-Vergleich ist deshalb nicht aussagekräftig; der echte
    Abgleich passiert in Better Auth nach dem Entschlüsseln (siehe
    <code>parseGenericState</code>). Der exakte <code>error_code</code> im
    Server-Log ist deshalb die präziseste Spur:
    <code>state_not_found</code>, <code>state_mismatch</code> (Cookie fehlt),
    <code>state_security_mismatch</code> (gespeicherter Wert weicht ab),
    <code>state_invalid</code> (Dechiffrieren/Parse).</small></td>
  </tr>`

  return {
    setCookieTest,
    html: renderDiagnoseHtml({
      error,
      errorDesc,
      queryRows,
      stateVergleich,
      cookieRows,
      configRows,
      headerRows,
      method: req.method,
      host: url.host,
      origin: escapeHtml(req.headers.get('origin') ?? '(keine)'),
      referer: escapeHtml(req.headers.get('referer') ?? '(keine)'),
      action: params.get('action'),
    }),
  }
}
interface DiagnosePageData {
  error: string
  errorDesc: string
  queryRows: string
  stateVergleich: string
  cookieRows: string
  configRows: string
  headerRows: string
  method: string
  host: string
  origin: string
  referer: string
  action: string | null
}

function renderDiagnoseHtml(data: DiagnosePageData): string {
  const testCookieLink = data.action === 'set-cookie-test'
    ? `<p><strong>Test-Cookie wurde gesetzt</strong> – unten prüfen, ob er jetzt
       in <code>Relevante Cookies</code> auftaucht (sonst blockiert der Browser
       bzw. die Domain-Konfiguration Cookies).</p>`
    : `<p><a href="?action=set-cookie-test">Test-Cookie setzen</a> – setzt einen
       harmlosen Nonce-Cookie mit denselben Attributen wie der echte
       <code>oauth_state</code> und lädt die Seite neu (zeigt, ob der Browser
       auf dieser Domain Cookies über Navigationen behält).</p>`

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>OAuth-Diagnose (state_mismatch)</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; margin: 2rem auto; max-width: 1000px; padding: 0 1rem; color: #222; }
      h1 { font-size: 1.4rem; }
      .badge { display: inline-block; background: #dc2626; color: #fff; padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.7rem; margin-left: 0.5rem; vertical-align: middle; }
      .notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 0.75rem 1rem; border-radius: 8px; margin: 1rem 0; }
      h2 { font-size: 1.1rem; margin-top: 2rem; border-bottom: 1px solid #eee; padding-bottom: 0.3rem; }
      table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; }
      th, td { border: 1px solid #e5e7eb; padding: 0.4rem 0.6rem; text-align: left; font-size: 0.85rem; vertical-align: top; }
      th { background: #f9fafb; }
      code { background: #f3f4f6; padding: 0.1rem 0.3rem; border-radius: 4px; font-size: 0.8rem; word-break: break-all; }
      a { color: #2563eb; }
      small { color: #6b7280; }
    </style>
  </head>
  <body>
    <h1>OAuth-Diagnose <span class="badge">TEMPORÄR / NUR MIT AUTH_DEBUG</span></h1>
    <div class="notice">
      <strong>Sicherheit:</strong> Es werden <strong>niemals</strong> OAuth-Codes,
      Tokens, Secrets oder vollständige Cookie-Werte angezeigt – nur Vorhandenheit,
      Länge und SHA-256-Hashes. Ohne die Env <code>AUTH_DEBUG=1</code> antwortet
      diese Route mit 404.
    </div>

    <h2>Fehler-Infos (aus der URL)</h2>
    <p><strong>error:</strong> ${data.error || '(keine)'}</p>
    <p><strong>error_description:</strong> ${data.errorDesc || '(keine)'}</p>

    <h2>Query-Parameter</h2>
    <table>
      <thead><tr><th>Schlüssel</th><th colspan="3">Wert / Detail</th></tr></thead>
      <tbody>
        ${data.queryRows || '<tr><td colspan="4">(keine Query-Parameter)</td></tr>'}
      </tbody>
    </table>

    <h2>State-Vergleich (für die Fehlersuche)</h2>
    <table>
      <thead><tr><th>Wo?</th><th>Vorhanden</th><th>Länge</th></tr></thead>
      <tbody>${data.stateVergleich}</tbody>
    </table>

    <h2>Relevante Cookies</h2>
    ${testCookieLink}
    <table>
      <thead><tr><th>Name</th><th>Vorhanden</th><th>Länge</th><th>SHA-256 (gekürzt)</th></tr></thead>
      <tbody>${data.cookieRows || '<tr><td colspan="4">(keine Cookies)</td></tr>'}</tbody>
    </table>

    <h2>Cookie-Konfiguration (aus der laufenden Better-Auth-Instanz, ohne Secrets)</h2>
    <table>
      <tbody>${data.configRows}</tbody>
    </table>

    <h2>Request-Informationen</h2>
    <table>
      <tbody>
        <tr><td>Methode</td><td>${data.method}</td></tr>
        <tr><td>Host</td><td>${data.host}</td></tr>
        <tr><td>Origin</td><td>${data.origin}</td></tr>
        <tr><td>Referer</td><td>${data.referer}</td></tr>
      </tbody>
    </table>

    <h2>Vercel-/Forward-Header (nur Vorhandenheit)</h2>
    <table>
      <thead><tr><th>Header</th><th>Vorhanden</th></tr></thead>
      <tbody>${data.headerRows || '<tr><td colspan="2">(keine)</td></tr>'}</tbody>
    </table>

    <hr />
    <small>Temporäre Diagnose-Seite – nach der Fehlersuche zusammen mit
    <code>AUTH_DEBUG</code> wieder entfernen.</small>
  </body>
</html>`
}