interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  /**
   * Log-Level des Auth-Clients: debug | info | warn | error
   * (Standard: debug in Dev, warn in Produktion, leise in Tests).
   */
  readonly VITE_AUTH_LOG_LEVEL?: string
  /** Von Vite ersetzte Standardfelder (für den Auth-Logger). */
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
