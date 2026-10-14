import type { Translations } from '../../i18n/index'

export const translations = {
  de: {
    'conectink.nav.main': 'Conectink',
    /* Startseite */
    'conectink.home.title': 'Conectink',
    'conectink.home.description':
      'Finde Leute, verbinde dich und pflege dein Netzwerk.',
    'conectink.home.cta': 'Zu Conectink',
    'conectink.page.title': 'Conectink',
    'conectink.page.description':
      'Suche Leute per Name und stelle Connect-Anfragen.',
    /* Tabs */
    'conectink.tabs.label': 'Conectink-Bereiche',
    'conectink.tabs.discover': 'Entdecken',
    'conectink.tabs.requests': 'Anfragen',
    'conectink.tabs.connections': 'Verbunden',
    /* Suche */
    'conectink.search.title': 'Leute finden',
    'conectink.search.label': 'Name',
    'conectink.search.placeholder': 'Name eingeben …',
    'conectink.search.button': 'Suchen',
    'conectink.search.emptyQuery':
      'Gib einen Namen ein, um nach Leuten zu suchen.',
    'conectink.search.loading': 'Suche läuft …',
    'conectink.search.error': 'Suche fehlgeschlagen. Bitte erneut versuchen.',
    'conectink.search.noResults': 'Keine Treffer für „{query}".',
    /* Relation (Suche) */
    'conectink.relation.connect': 'Verbinden',
    'conectink.relation.requestAgain': 'Erneut anfragen',
    'conectink.relation.requestSent': 'Anfrage gesendet',
    'conectink.relation.connected': 'Verbunden',
    'conectink.relation.ignored': 'Ignoriert',
    'conectink.relation.incoming': 'Anfrage ansehen',
    /* Anfragen */
    'conectink.requests.incoming': 'Eingehende Anfragen',
    'conectink.requests.outgoing': 'Gesendete Anfragen',
    'conectink.requests.incomingEmpty': 'Keine offenen Anfragen.',
    'conectink.requests.outgoingEmpty': 'Noch keine Anfragen gesendet.',
    'conectink.requests.accept': 'Akzeptieren',
    'conectink.requests.reject': 'Ablehnen',
    'conectink.requests.ignore': 'Ignorieren',
    'conectink.requests.waiting': 'Wartet auf Antwort',
    /* Verbunden */
    'conectink.connections.title': 'Verbunden',
    'conectink.connections.empty':
      'Noch keine Verbindungen. Suche Leute und stelle eine Anfrage!',
    'conectink.connections.since': 'Verbunden seit {date}',
    'conectink.connections.remove': 'Entfernen',
    'conectink.connections.removeConfirmTitle':
      'Verbindung zu {name} entfernen?',
    'conectink.connections.removeConfirmDescription':
      'Die Verbindung wird aufgelöst. Danach kann neu angefragt werden.',
    'conectink.confirm.cancel': 'Abbrechen',
    /* Allgemein */
    'conectink.loading': 'Wird geladen …',
    'conectink.loadError': 'Daten konnten nicht geladen werden.',
    'conectink.errors.requestFailed':
      'Aktion fehlgeschlagen. Bitte erneut versuchen.',
  },
  en: {
    'conectink.nav.main': 'Conectink',
    /* Home */
    'conectink.home.title': 'Conectink',
    'conectink.home.description': 'Find people, connect and grow your network.',
    'conectink.home.cta': 'Go to Conectink',
    'conectink.page.title': 'Conectink',
    'conectink.page.description':
      'Search people by name and send connect requests.',
    /* Tabs */
    'conectink.tabs.label': 'Conectink sections',
    'conectink.tabs.discover': 'Discover',
    'conectink.tabs.requests': 'Requests',
    'conectink.tabs.connections': 'Connected',
    /* Search */
    'conectink.search.title': 'Find people',
    'conectink.search.label': 'Name',
    'conectink.search.placeholder': 'Enter a name …',
    'conectink.search.button': 'Search',
    'conectink.search.emptyQuery': 'Enter a name to search for people.',
    'conectink.search.loading': 'Searching …',
    'conectink.search.error': 'Search failed. Please try again.',
    'conectink.search.noResults': 'No results for "{query}".',
    /* Relation (search) */
    'conectink.relation.connect': 'Connect',
    'conectink.relation.requestAgain': 'Request again',
    'conectink.relation.requestSent': 'Request sent',
    'conectink.relation.connected': 'Connected',
    'conectink.relation.ignored': 'Ignored',
    'conectink.relation.incoming': 'View request',
    /* Requests */
    'conectink.requests.incoming': 'Incoming requests',
    'conectink.requests.outgoing': 'Sent requests',
    'conectink.requests.incomingEmpty': 'No open requests.',
    'conectink.requests.outgoingEmpty': 'No requests sent yet.',
    'conectink.requests.accept': 'Accept',
    'conectink.requests.reject': 'Reject',
    'conectink.requests.ignore': 'Ignore',
    'conectink.requests.waiting': 'Waiting for reply',
    /* Connected */
    'conectink.connections.title': 'Connected',
    'conectink.connections.empty':
      'No connections yet. Search people and send a request!',
    'conectink.connections.since': 'Connected since {date}',
    'conectink.connections.remove': 'Remove',
    'conectink.connections.removeConfirmTitle': 'Remove connection to {name}?',
    'conectink.connections.removeConfirmDescription':
      'The connection will be dissolved. After that, a new request is possible.',
    'conectink.confirm.cancel': 'Cancel',
    /* General */
    'conectink.loading': 'Loading …',
    'conectink.loadError': 'Could not load data.',
    'conectink.errors.requestFailed': 'Action failed. Please try again.',
  },
} satisfies Translations
