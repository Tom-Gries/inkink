import { createAuthClient } from 'better-auth/react'
import { getApiBaseUrl } from './client'

/** Typsicherer Better-Auth-Client für die Hono-API (apps/api). */
export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
})

export type AuthClient = typeof authClient

export async function isAuthenticated(): Promise<boolean> {
  const { data } = await authClient.getSession()

  return Boolean(data?.user)
}