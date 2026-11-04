import type { Locale } from '../i18n/index'

interface PrivacyLink {
  label: string
  href: string
}

interface PrivacySection {
  id: string
  title: string
  paragraphs: string[]
  items?: string[]
  links?: PrivacyLink[]
}

interface PrivacyContent {
  title: string
  description: string
  updated: string
  controller: string
  country: string
  contents: string
  settings: string
  contact: string
  hostingNotice: string
  sections: PrivacySection[]
}

/**
 * Before publication, verify the actual Vercel plan/contract and roles, Atlas
 * region (including backups), log/backup retention and the applicable transfer
 * mechanism. Vercel's DPA dated 2026-03-17 covers Pro/Enterprise processor use;
 * it must not be presented as a verified agreement for an unknown Hobby plan.
 * No particular region, retention period, DPA or transfer safeguard is asserted
 * below because these account settings have not been confirmed.
 */
export const privacyContent = {
  de: {
    title: 'Datenschutz',
    description: 'Wie InkInk mit deinen personenbezogenen Daten umgeht.',
    updated: 'Stand: 4. November 2026',
    controller: 'Verantwortlicher und Kontakt',
    country: 'Deutschland',
    contents: 'Inhalt der Datenschutzhinweise',
    settings: 'Einstellungen und eigene Daten',
    contact: 'Fragen zum Datenschutz und Anfragen zu deinen Rechten:',
    hostingNotice:
      'Angaben zur Aufbewahrung bei den Hostinganbietern und zu internationalen Datenübermittlungen sind noch in Prüfung. Diese Datenschutzhinweise werden hierzu ergänzt.',
    sections: [
      {
        id: 'website',
        title: 'Aufruf der Website und technischer Betrieb',
        paragraphs: [
          'Beim Aufrufen von InkInk werden technisch notwendige Verbindungsdaten verarbeitet. Dazu gehören insbesondere IP-Adresse, Zeitpunkt, aufgerufene Adresse, Browserinformationen und der technische Status der Anfrage. Das ist erforderlich, um die Website auszuliefern, Fehler zu erkennen und Angriffe abzuwehren.',
          'Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe f DSGVO. Das berechtigte Interesse besteht in der sicheren und funktionsfähigen Bereitstellung dieses privaten Webangebots.',
          'Für Hosting und Ausführung der Anwendung wird Vercel eingesetzt; die Anwendungsdaten liegen in einer MongoDB-Atlas-Datenbank. Diese Anbieter erhalten die für ihre jeweilige technische Leistung erforderlichen Daten. Je nach Anbieter und Konfiguration können auch Verarbeitungen außerhalb des Europäischen Wirtschaftsraums stattfinden.',
        ],
        links: [
          {
            label: 'Datenschutzhinweise von Vercel',
            href: 'https://vercel.com/legal/privacy-policy',
          },
          {
            label: 'Datenschutzhinweise von MongoDB',
            href: 'https://www.mongodb.com/legal/privacy-policy',
          },
        ],
      },
      {
        id: 'account',
        title: 'Google-Anmeldung und Benutzerkonto',
        paragraphs: [
          'Die Anmeldung erfolgt über Google. Erst wenn du die Google-Anmeldung aufrufst, wirst du zu Google weitergeleitet. Google verarbeitet den Anmeldevorgang nach seinen eigenen Datenschutzbestimmungen. Für Nutzer im Europäischen Wirtschaftsraum ist grundsätzlich Google Ireland Limited zuständig.',
          'InkInk erhält dabei die von Google bereitgestellte Konto-Kennung, deinen Namen, deine E-Mail-Adresse, den Bestätigungsstatus der E-Mail und gegebenenfalls die Adresse deines Profilbilds. Außerdem werden Konto- und Sitzungsdaten sowie die für die Anmeldung erforderlichen Berechtigungsdaten gespeichert. InkInk erhält dein Google-Passwort nicht.',
          'Diese Daten dienen der Zuordnung und Absicherung deines Benutzerkontos und der Bereitstellung der von dir angefragten Kontofunktionen. Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe b DSGVO. Das Konto ist freiwillig; ohne Anmeldung stehen geschützte Funktionen nicht zur Verfügung.',
          'Für die Anzeige von Nutzerbildern verwendet InkInk lokal erzeugte Initialen. Die bei Google gespeicherte Profilbildadresse wird dafür nicht im Browser abgerufen.',
        ],
        links: [
          {
            label: 'Google-Datenschutzerklärung',
            href: 'https://policies.google.com/privacy?hl=de',
          },
        ],
      },
      {
        id: 'features',
        title: 'Daten in den App-Funktionen und ihre Sichtbarkeit',
        paragraphs: [
          'Welche weiteren Daten gespeichert werden, hängt davon ab, welche Funktionen du nutzt. Die folgenden Verarbeitungen dienen der Bereitstellung deiner angefragten Funktionen und beruhen auf Artikel 6 Absatz 1 Buchstabe b DSGVO. Für freiwillige Gefühlseinträge gilt die gesonderte Einwilligung im nächsten Abschnitt.',
        ],
        items: [
          'Profil und Kontakte: dein Benutzername, Verbindungsanfragen, Kontaktbeziehungen, Gruppen, Einladungen und Mitgliedschaften. Andere angemeldete Nutzer können dich über die Nutzersuche finden; Beteiligte sehen die für Kontakte und Gruppen vorgesehenen Angaben. Deine E-Mail-Adresse wird dort nicht angezeigt.',
          'Lernstacks: Titel, angegebener Erstellername, Fragen, Antworten, Erklärungen und Einstellungen. Bei angemeldeten Nutzern sind neue Stacks zunächst privat. Wenn du einen Stack veröffentlichst, können seine Inhalte und der Erstellername öffentlich sichtbar werden. Bei einer Zuordnung zu Gruppen können deren berechtigte Mitglieder darauf zugreifen. Ohne Anmeldung erstellte Stacks sind öffentlich.',
          'Ranglisten: Wenn du dich ausdrücklich einträgst, werden dein gewählter Ranglistenname, Punktzahl und Zeit beim jeweiligen Stack gespeichert und für dessen berechtigte Leser angezeigt. Verwende einen frei gewählten Namen, wenn du deinen Klarnamen nicht veröffentlichen möchtest.',
          'Mindmaps: Titel, Inhalte, Verbindungen, Layout und Änderungszeitpunkt werden deinem Konto zugeordnet und für dich gespeichert.',
        ],
      },
      {
        id: 'feelings',
        title: 'Freiwillige Gefühlseinträge',
        paragraphs: [
          'Soweit Feelink für die Speicherung freigeschaltet ist, werden deine ausgewählten Gefühle, eine optionale Notiz und der Zeitpunkt des Eintrags zusammen mit deiner Konto-Kennung gespeichert. Diese Inhalte können sensible Informationen über deine Gesundheit enthalten. Sie werden dir in deinem persönlichen Verlauf angezeigt und nicht für andere Nutzer freigegeben.',
          'Für jeden neuen Eintrag ist eine eigene ausdrückliche Einwilligung erforderlich. Rechtsgrundlagen sind Artikel 6 Absatz 1 Buchstabe a und, soweit Gesundheitsdaten betroffen sind, Artikel 9 Absatz 2 Buchstabe a DSGVO. Der Zweck ist ausschließlich, dir deinen eigenen Gefühlsverlauf bereitzustellen. Deine Einwilligung wird beim jeweiligen Eintrag dokumentiert.',
          'Die Einwilligung ist freiwillig. Du kannst sie für einen Eintrag jederzeit durch dessen Löschung widerrufen oder dich für den Widerruf und die Löschung aller Einträge an die oben genannte Kontaktadresse wenden. Andere App-Funktionen kannst du ohne diese Einwilligung nutzen. Die Rechtmäßigkeit der Verarbeitung vor dem Widerruf bleibt unberührt.',
          'Die Speicherung ist standardmäßig ausgeschaltet und muss vom Betreiber ausdrücklich freigeschaltet werden. Eine Einwilligung allein ersetzt keine geeignete Hosting- und Datenschutzkonfiguration. Trage keine sensiblen Angaben über andere Personen ein.',
        ],
      },
      {
        id: 'storage',
        title: 'Cookies, lokale Speicherung und Analyse',
        paragraphs: [
          'Für die von dir angeforderte Anmeldung und die Absicherung der Sitzung werden notwendige Cookies beziehungsweise Anmeldedaten verwendet. Die von dir gewählte Sprache wird unter „inkink.locale“ lokal in deinem Browser gespeichert. Diese Speicherung dient der ausdrücklich gewünschten Anmeldung beziehungsweise Sprachwahl und richtet sich nach § 25 Absatz 2 Nummer 2 TDDDG; für die zugehörigen personenbezogenen Daten gelten die zuvor genannten Rechtsgrundlagen.',
          'InkInk bindet keine Werbetracker oder externen Schriftartendienste ein. Es gibt keine von InkInk erstellten Werbeprofile und keine automatisierten Entscheidungen, die dir gegenüber rechtliche oder ähnlich erhebliche Wirkungen entfalten.',
          'Du kannst Cookies und lokale Website-Daten in deinem Browser löschen. Dabei können deine Anmeldung und die gespeicherte Sprachwahl verloren gehen.',
        ],
      },
      {
        id: 'contact',
        title: 'Kontakt per E-Mail',
        paragraphs: [
          'Wenn du eine E-Mail an die angegebene Kontaktadresse schickst, werden deine E-Mail-Adresse, der Inhalt und die zur Bearbeitung erforderlichen Angaben verarbeitet. Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe f DSGVO; das berechtigte Interesse besteht in der Beantwortung deiner Anfrage. Soweit deine Anfrage die Bereitstellung deines Kontos betrifft, gilt Artikel 6 Absatz 1 Buchstabe b DSGVO.',
          'Die Kontaktadresse ist ein Gmail-Postfach. Google verarbeitet deshalb die zur E-Mail-Zustellung und Speicherung notwendigen Daten. Sende auf diesem Weg nur die für dein Anliegen notwendigen Informationen.',
        ],
        links: [
          {
            label: 'Google-Datenschutzerklärung',
            href: 'https://policies.google.com/privacy?hl=de',
          },
        ],
      },
      {
        id: 'retention',
        title: 'Speicherdauer und Löschung',
        paragraphs: [
          'Anmeldesitzungen laufen nach sieben Tagen ab, sofern sie nicht durch weitere Nutzung verlängert werden. Kurzlebige Zustandsdaten zur Absicherung einer Google-Anmeldung laufen nach zehn Minuten ab. Die Datenbank entfernt abgelaufene Sitzungs- und Zustandsdaten anschließend automatisch; diese Bereinigung kann technisch verzögert erfolgen.',
          'Konto- und App-Daten bleiben grundsätzlich gespeichert, solange du dein Konto beziehungsweise die betreffenden Inhalte nutzt. Das bloße Abmelden löscht diese Inhalte nicht. Einzelne löschbare Inhalte kannst du in der jeweiligen Funktion entfernen. In den Einstellungen kannst du deine Daten exportieren und dein Konto nach erneuter Anmeldung und zusätzlicher Bestätigung selbst löschen.',
          'Die Kontolöschung entfernt die deinem Konto zugeordneten Daten aus dem aktiven Anwendungssystem. Dazu gehören auch deine veröffentlichten Stacks samt zugehörigen Ranglisten sowie deine zuordenbaren Ranglisteneinträge in fremden Stacks. Kontaktbeziehungen und deine Gruppenmitgliedschaften werden entfernt. Von dir geleitete Gruppen können an verbleibende berechtigte Mitglieder übergeben werden; fremde Inhalte bleiben erhalten.',
          'Die Löschung erfolgt in mehreren Schritten. Bei einer technischen Unterbrechung kann sie unvollständig bleiben. Ein vorübergehender Löschstatus kann bis zu 24 Stunden gespeichert bleiben und währenddessen die normale Appnutzung sperren. Du kannst einen unterbrochenen Vorgang erneut starten oder dich an die Kontaktadresse wenden.',
          'Bereits von anderen Personen unabhängig gespeicherte Kopien öffentlicher Inhalte können durch die Kontolöschung nicht zurückgerufen werden. Ältere oder anonyme Ranglisteneinträge sowie anonyme Veröffentlichungen ohne eindeutigen Kontobezug können nicht immer automatisch zugeordnet werden. Bitte nenne solche Inhalte in einer ergänzenden Löschanfrage an die Kontaktadresse.',
          'Gefühlseinträge bleiben bis zur Einzellöschung oder zur Bearbeitung deines Widerrufs beziehungsweise Löschverlangens gespeichert. Kontaktanfragen werden für die Bearbeitung und erforderliche Nachfragen aufbewahrt; danach entfällt dieser Verarbeitungszweck. Soweit eine weitere Aufbewahrung gesetzlich erforderlich oder zur Geltendmachung beziehungsweise Abwehr konkreter Rechtsansprüche notwendig ist, wird sie auf diesen Zweck beschränkt.',
          'Für technisch erstellte Anbieterprotokolle, Anmeldeinformationen und Sicherungskopien gelten die tatsächlichen Betriebs- und Ablaufbedingungen der eingesetzten Dienste. Die Angaben zu Speicherfristen, Regionen und internationalen Übermittlungen werden nach Bestätigung der Anbieterkonfiguration ergänzt.',
        ],
      },
      {
        id: 'rights',
        title: 'Deine Rechte',
        paragraphs: [
          'Unter den gesetzlichen Voraussetzungen hast du Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit. Du kannst dich dafür an die oben genannte Kontaktadresse wenden. In den Einstellungen stehen zusätzlich ein Datenexport und die bestätigte Kontolöschung zur Verfügung. Für ergänzende Löschanfragen oder Schwierigkeiten mit diesen Funktionen bleibt der Kontakt per E-Mail möglich.',
          'Einwilligungen kannst du jederzeit mit Wirkung für die Zukunft widerrufen. Soweit Daten aufgrund berechtigter Interessen nach Artikel 6 Absatz 1 Buchstabe f DSGVO verarbeitet werden, kannst du aus Gründen deiner besonderen Situation nach Artikel 21 DSGVO widersprechen.',
          'Du kannst dich bei einer Datenschutzaufsichtsbehörde beschweren, insbesondere an deinem Aufenthaltsort, Arbeitsplatz oder dem Ort des vermuteten Verstoßes. Für den Verantwortlichen in Hamburg ist der Hamburgische Beauftragte für Datenschutz und Informationsfreiheit eine Anlaufstelle.',
        ],
        links: [
          {
            label: 'Beschwerde beim HmbBfDI',
            href: 'https://datenschutz-hamburg.de/service-information/beschwerde-oder-hinweis-einreichen',
          },
        ],
      },
    ],
  },
  en: {
    title: 'Privacy',
    description: 'How InkInk processes your personal data.',
    updated: 'Last updated: 4 November 2026',
    controller: 'Controller and contact',
    country: 'Germany',
    contents: 'Contents of this privacy notice',
    settings: 'Settings and your data',
    contact: 'For privacy questions and requests concerning your rights:',
    hostingNotice:
      'Retention by the hosting providers and international data transfers are still being reviewed. This privacy notice will be supplemented with those details.',
    sections: [
      {
        id: 'website',
        title: 'Website access and technical operation',
        paragraphs: [
          'Accessing InkInk involves processing connection data needed to deliver the website. This includes your IP address, time of access, requested address, browser information and the technical status of the request. This is necessary to provide the website, identify faults and prevent attacks.',
          'The legal basis is Article 6(1)(f) GDPR. The legitimate interest is providing this private website securely and reliably.',
          'Vercel hosts and runs the application; application data is stored in a MongoDB Atlas database. These providers receive the data required for their respective technical services. Depending on the provider and configuration, processing may also take place outside the European Economic Area.',
        ],
        links: [
          {
            label: 'Vercel privacy notice',
            href: 'https://vercel.com/legal/privacy-policy',
          },
          {
            label: 'MongoDB privacy notice',
            href: 'https://www.mongodb.com/legal/privacy-policy',
          },
        ],
      },
      {
        id: 'account',
        title: 'Google sign-in and your account',
        paragraphs: [
          'You sign in through Google. You are redirected to Google only when you initiate Google sign-in. Google processes that sign-in according to its own privacy terms. Google Ireland Limited is generally responsible for users in the European Economic Area.',
          'InkInk receives the account identifier supplied by Google, your name, email address, email verification status and, if provided, your profile image address. Account and session information and authorization data required for sign-in are also stored. InkInk does not receive your Google password.',
          'This data identifies and protects your account and provides the account functions you request. The legal basis is Article 6(1)(b) GDPR. Having an account is voluntary; protected functions are unavailable without signing in.',
          'InkInk displays locally generated initials as user pictures. Your Google profile image address is not loaded in the browser for this purpose.',
        ],
        links: [
          {
            label: 'Google privacy policy',
            href: 'https://policies.google.com/privacy?hl=en',
          },
        ],
      },
      {
        id: 'features',
        title: 'App data and visibility',
        paragraphs: [
          'Other data stored depends on the features you use. The following processing provides the functions you request and is based on Article 6(1)(b) GDPR. Voluntary feeling entries are covered by the separate consent described below.',
        ],
        items: [
          'Profile and contacts: your username, connection requests, contact relationships, groups, invitations and memberships. Other signed-in users can find you using the user search; participants see information intended for contact and group functions. Your email address is not shown there.',
          'Learning stacks: title, supplied creator name, questions, answers, explanations and settings. New stacks created by signed-in users are private initially. Publishing a stack can make its content and creator name public. Sharing with groups can give their authorized members access. Stacks created without signing in are public.',
          'Leaderboards: when you explicitly choose to submit an entry, the name you select, score and time are stored with the stack and shown to its authorized readers. Choose a nickname if you do not want to publish your real name.',
          'Mind maps: titles, content, connections, layout and modification time are stored for you and associated with your account.',
        ],
      },
      {
        id: 'feelings',
        title: 'Voluntary feeling entries',
        paragraphs: [
          'Where Feelink storage is enabled, it stores the feelings you select, an optional note and the time of the entry together with your account identifier. These entries may include sensitive information about your health. They are shown in your personal history and are not shared with other users.',
          'Each new entry requires separate explicit consent. The legal bases are Article 6(1)(a) GDPR and, where health data is involved, Article 9(2)(a) GDPR. The sole purpose is to provide your own feeling history. Your consent is documented with the relevant entry.',
          'Consent is voluntary. You can withdraw it for an entry at any time by deleting that entry, or contact the address above to withdraw consent and request deletion of all entries. You can use other app functions without this consent. Withdrawal does not affect the lawfulness of earlier processing.',
          'Storage is disabled by default and must be explicitly enabled by the operator. Consent alone does not replace suitable hosting and privacy arrangements. Do not enter sensitive information about other people.',
        ],
      },
      {
        id: 'storage',
        title: 'Cookies, local storage and analytics',
        paragraphs: [
          'Necessary cookies or sign-in data support the sign-in you request and protect your session. Your chosen language is stored locally in your browser as “inkink.locale”. This storage serves the sign-in or language choice you expressly request and is covered by section 25(2)(2) of the German TDDDG. Related personal data is processed on the legal bases described above.',
          'InkInk does not embed advertising trackers or external font services. InkInk does not create advertising profiles or make automated decisions that produce legal or similarly significant effects concerning you.',
          'You can delete cookies and local website data using your browser settings. This may sign you out and remove your saved language choice.',
        ],
      },
      {
        id: 'contact',
        title: 'Email contact',
        paragraphs: [
          'If you email the contact address, your email address, message and information needed to handle your request are processed. The legal basis is Article 6(1)(f) GDPR; the legitimate interest is answering your request. Article 6(1)(b) GDPR applies where the request concerns providing your account.',
          'The contact address is a Gmail mailbox. Google therefore processes data needed to deliver and store those emails. Please send only the information necessary for your request.',
        ],
        links: [
          {
            label: 'Google privacy policy',
            href: 'https://policies.google.com/privacy?hl=en',
          },
        ],
      },
      {
        id: 'retention',
        title: 'Retention and deletion',
        paragraphs: [
          'Sign-in sessions expire after seven days unless extended by further use. Short-lived state data that secures a Google sign-in expires after ten minutes. The database then removes expired session and state records automatically; this cleanup can be technically delayed.',
          'Account and app data generally remains stored while you use your account or the relevant content. Signing out does not delete that content. You can remove individual deletable items in the relevant feature. Settings also let you export your data and delete your account after signing in again and providing additional confirmation.',
          'Account deletion removes data associated with your account from the active application system. This includes your published stacks and their leaderboards, as well as identifiable leaderboard entries of yours in other stacks. Your contact relationships and group memberships are removed. Groups you lead may be handed over to remaining authorized members; content belonging to others is preserved.',
          'Deletion takes place in several steps. A technical interruption may leave it incomplete. A temporary deletion status may remain stored for up to 24 hours and block normal app use during that time. You can retry an interrupted deletion or contact the address above for assistance.',
          'Account deletion cannot recall copies of public content independently saved by other people. Older or anonymous leaderboard entries and anonymous publications without a clear account connection cannot always be identified automatically. Please identify such content in an additional erasure request to the contact address.',
          'Feeling entries remain stored until you delete them or your withdrawal or erasure request has been processed. Contact messages are retained to address the request and necessary follow-up questions; that purpose ends afterwards. Where further retention is legally required or necessary for specific legal claims, processing is restricted to that purpose.',
          'Provider logs, sign-in information and backups are subject to the actual operation and expiry conditions of the services used. Details of retention periods, regions and international transfers will be added after the provider configuration has been confirmed.',
        ],
      },
      {
        id: 'rights',
        title: 'Your rights',
        paragraphs: [
          'Subject to the applicable legal conditions, you have rights of access, rectification, erasure, restriction of processing and data portability. Contact the address above to exercise them. Settings also provide a data export and account deletion with confirmation. You can still contact us by email for additional erasure requests or difficulties using these functions.',
          'You can withdraw consent at any time for the future. Where processing is based on legitimate interests under Article 6(1)(f) GDPR, Article 21 GDPR allows you to object on grounds relating to your particular situation.',
          'You may lodge a complaint with a data protection authority, particularly in the country where you live, work or believe an infringement occurred. The Hamburg Commissioner for Data Protection and Freedom of Information is one point of contact for the controller in Hamburg.',
        ],
        links: [
          {
            label: 'Complain to the Hamburg data protection authority',
            href: 'https://datenschutz-hamburg.de/service-information/beschwerde-oder-hinweis-einreichen',
          },
        ],
      },
    ],
  },
} satisfies Record<Locale, PrivacyContent>
