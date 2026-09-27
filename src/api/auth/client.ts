import { createAuthClient } from 'better-auth/react'

import { getApiBaseUrl } from '../client'

const baseURL = getApiBaseUrl()

/** Typsicherer Better-Auth-Client für die Hono-API (api/). */
export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: 'include',
  },
})

export type AuthClient = typeof authClient
