import { authClient } from './client'
import { authError, authLog, authWarn } from './logger'

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
  authLog('guard', 'isAuthenticated: Session-Check gestartet')

  try {
    const { data, error } = await authClient.getSession()

    if (error) {
      // Better Auth liefert im Fehlerfall data=null, error gesetzt.
      authWarn(
        'guard',
        'isAuthenticated: getSession meldet einen Fehler (wird als „nicht authentifiziert" gewertet)',
        error,
      )
      return false
    }

    if (data?.user) {
      authLog('guard', `isAuthenticated: authentifiziert (user=${data.user.id})`)
      return true
    }

    authLog('guard', 'isAuthenticated: keine gültige Session → false')
    return false
  } catch (error) {
    authError(
      'guard',
      'isAuthenticated: Session-Request fehlgeschlagen (fail-closed → false)',
      error,
    )
    return false
  }
}