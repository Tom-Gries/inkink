import type { Translations } from '@inkink/i18n'

export const translations = {
  de: {
    'startink.start': 'Start',
    'startink.ziel': 'Ziel',
    'startink.testButton': 'Test-Nachricht senden',
    'startink.testSuccess': 'Test-Nachricht in der Datenbank gespeichert',
    'startink.testError': 'Fehler',
    'startink.signIn': 'Mit Google anmelden',
    'startink.signOut': 'Abmelden',
    'startink.loggedInAs': 'Angemeldet als',
    'startink.serverSession': 'Server-Session',
    'startink.noServerSession': 'Nicht am Server angemeldet',
  },
  en: {
    'startink.start': 'Start',
    'startink.ziel': 'Goal',
    'startink.testButton': 'Send test message',
    'startink.testSuccess': 'Test message saved to the database',
    'startink.testError': 'Error',
    'startink.signIn': 'Sign in with Google',
    'startink.signOut': 'Sign out',
    'startink.loggedInAs': 'Signed in as',
    'startink.serverSession': 'Server session',
    'startink.noServerSession': 'Not signed in on the server',
  },
} satisfies Translations
