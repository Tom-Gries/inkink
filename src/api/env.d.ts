interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  /** Von Vite bereitgestellte Standard-Metafelder. */
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
