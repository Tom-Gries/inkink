import type { Translations } from '@inkink/i18n'

/** Übersetzungen des React-Auth-UI-Packages (z. B. LoginGate). */
export const authTranslations = {
  de: {
    'auth.login.title': 'Anmelden',
    'auth.login.subtitle': 'Melde dich an, um geschützte Seiten zu besuchen.',
    'auth.login.google': 'Mit Google anmelden',
    'auth.login.checking': 'Anmeldestatus wird geprüft …',
    'auth.login.error': 'Anmeldestatus konnte nicht geladen werden',
    'auth.login.footer': 'Anmelden',
    'auth.signOut': 'Abmelden',
  },
  en: {
    'auth.login.title': 'Sign in',
    'auth.login.subtitle': 'Sign in to visit protected pages.',
    'auth.login.google': 'Sign in with Google',
    'auth.login.checking': 'Checking sign-in status …',
    'auth.login.error': 'Could not load sign-in status',
    'auth.login.footer': 'Sign in',
    'auth.signOut': 'Sign out',
  },
} satisfies Translations
