import { createAuthClient } from 'better-auth/react'

import { getApiBaseUrl } from '../client'

/** Typsicherer Better-Auth-Client für die Hono-API (apps/api). */
export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
  fetchOptions: {
    credentials: 'include',
  },
})

export type AuthClient = typeof authClient