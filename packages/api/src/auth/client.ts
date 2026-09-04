import { createAuthClient } from 'better-auth/react'

import { getApiBaseUrl } from '../client'
import { authInfo, authLog, authWarn } from './logger'

// Die Base-URL bewusst als Modul-Konstante ziehen: In den Logs sieht man
// sofort, gegen welche URL der Auth-Client arbeitet – ein häufiger Grund
// für „Auth geht nicht“ ist eine falsche VITE_API_URL.
const baseURL = getApiBaseUrl()

authLog('client', `createAuthClient: baseURL=${baseURL}`)

if (!/^https?:\/\//.test(baseURL)) {
  authWarn(
    'client',
    'baseURL beginnt nicht mit http(s):// – Session-Cookies (credentials/SameSite) laufen sonst ins Leere',
    baseURL,
  )
}

/** Typsicherer Better-Auth-Client für die Hono-API (apps/api). */
export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: 'include',
  },
})

authInfo('client', 'createAuthClient: Better-Auth-Client erstellt')

export type AuthClient = typeof authClient