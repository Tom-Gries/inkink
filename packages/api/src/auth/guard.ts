import { authClient } from './client'

/**
 * Prüft browserseitig, ob der aktuelle Benutzer authentifiziert ist.
 *
 * Kapselt den Better-Auth-Client für Route Guards (@inkink/routing),
 * die nur diese Funktion als Dependency erhalten – ohne Better Auth
 * selbst zu kennen.
 *
 * Fail-closed: Nur eine gültige Session mit Benutzer ergibt true. Ohne
 * oder mit ungültiger Session ergibt false; schlägt der Session-Request
 * fehl (z. B. API nicht erreichbar), wird das ebenfalls als „nicht
 * authentifiziert" gewertet – der Guard leitet dann zum Login weiter,
 * statt die Navigation kommentarlos abzubrechen. Niemals wird bei
 * einem Fehler true geliefert.
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data } = await authClient.getSession()

    return Boolean(data?.user)
  } catch {
    return false
  }
}