# InkInk: Datenschutz und öffentlicher Betrieb

Stand: 4. November 2026. Die Abschlussprüfung erfolgte am Quellcode mit
isolierten Tests, ohne Produktivdeploy oder Zugriff auf echte Nutzerdaten.

## Technische Abschlussprüfung am 4. November 2026

- API: 119 Tests in 15 Dateien bestanden.
- Web: 135 Tests in 20 Dateien bestanden. Zwei zusätzliche Regressionfälle
  prüfen, dass normalisierte Avatarpfade mit doppeltem Schrägstrich nicht als
  fremde Bildadressen verwendet werden können.
- Typprüfungen beider Projekte und der Web-Produktionsbuild erfolgreich.
- Gezielter Lint der angepassten Datenschutz-/Sicherheitsdateien erfolgreich;
  `git diff --check` ohne Fehler.
- Vite weist weiterhin auf ein JavaScript-Bundle über 500 kB hin. Der Build
  ist erfolgreich; eine spätere Aufteilung wäre eine Leistungsoptimierung.
- Referenzstand vor diesen Änderungen: Web `992776f`, API `adddc6a`.
  Der veröffentlichte Stand ist anhand des jeweiligen Git-Verlaufs zu prüfen;
  ältere Desktop-Klone müssen anschließend aktualisiert werden.

## Im Projekt umgesetzt

- **Impressum:** `/impressum`, mit den angegebenen Betreiber- und Kontaktdaten
  nach § 18 Absatz 1 MStV. Ohne Anmeldung, auch vom Loginbildschirm aus erreichbar.
- **Datenschutzhinweise:** `/datenschutz`, auf Deutsch und Englisch, mit
  Verantwortlichem, Datenarten, Zwecken, Rechtsgrundlagen, Sichtbarkeit,
  Einwilligung und Betroffenenrechten. Beide Rechtstexte sind in der Navigation
  verlinkt, auf Desktop und im mobilen Menü auch ohne Anmeldung.
  Noch unbekannte Hostingangaben werden ausdrücklich als offen bezeichnet.
- **Datenexport:** angemeldete Nutzer können in den Einstellungen ihre eigenen
  Daten als JSON herunterladen. Tokens, Passwörter und fremde private Inhalte
  werden nicht exportiert. Antworten dürfen nicht zwischengespeichert werden.
- **Kontolöschung:** nach ausdrücklicher Freigabe des konkreten Umfangs umgesetzt.
  Die Person muss sich innerhalb der letzten 15 Minuten angemeldet haben und
  die Löschung durch Texteingabe bestätigen. Eigene veröffentlichte Lernstacks
  werden mit gelöscht. Gruppen mit anderen aktiven Mitgliedern erhalten einen
  Nachfolger. Fremde Inhalte bleiben erhalten. Siehe den detaillierten
  [Löschplan](../api/ACCOUNT-DELETION-PLAN.md) zu Umfang und technischen Grenzen.
- **API-Zugriffe:** die ungenutzten öffentlichen `/api/users`-, `/api/test`- und
  Demo-Realtime-Routen sind nicht mehr registriert. Bestehende geschützte
  Funktionsrouten bleiben erhalten. Alle API-Antworten erhalten `no-store`.
- **Protokollierung:** eigene Auth-Logs enthalten keine OAuth-Querys, Namen,
  Nutzer-IDs, Secret-Längen oder rohen Fehler mehr. Es werden nur statische
  Ereignisse entsprechend `AUTH_LOG_LEVEL` ausgegeben. Hostinglogs sind davon
  getrennt und noch zu prüfen.
- **Sitzungsablauf:** sieben Tage Gültigkeit, bei weiterer aktiver Nutzung
  verlängerbar; Erneuerung frühestens nach 24 Stunden. OAuth-Zustandsdaten haben
  zehn Minuten Gültigkeit. TTL-Indizes entfernen abgelaufene Sitzungs- und
  Zustandsdokumente zeitversetzt. Die Datenbankrolle benötigt die nötigen
  Indexrechte; eine Konvertierung vorhandener Indizes benötigt `collMod`.
- **Feelink:** neue Gefühlseinträge sind ohne ausdrückliche Konfiguration
  standardmäßig ausgeschaltet. Vorhandene eigene Einträge können weiter gelesen,
  einzeln gelöscht und exportiert werden. Der vorbereitete Speicherablauf verlangt
  für jeden neuen Eintrag eine erneute ausdrückliche Einwilligung und dokumentiert
  deren Fassung und Zeitpunkt. Einwilligung ersetzt keinen geeigneten
  Hostingvertrag. `FEELINGS_ENABLED=true` erst nach Klärung dieses Rahmens setzen.
- **Sichtbarkeit:** neue Lernstacks angemeldeter Nutzer bleiben standardmäßig
  privat. Eine Veröffentlichung ist weiterhin ausdrücklich möglich. Anonym
  angelegte Stacks bleiben entsprechend der vorhandenen Funktion öffentlich;
  das wird im Editor und in den Datenschutzhinweisen erklärt. Vorhandene
  Veröffentlichungen wurden nicht pauschal verändert. Neue angemeldete
  Ranglisteneinträge erhalten intern eine Nutzerzuordnung für Export/Löschung;
  diese interne Kennung wird nicht im öffentlichen Stack-DTO ausgeliefert.
- **Profilbilder:** fremde Bild-URLs werden nicht automatisch abgerufen.
  Anbieterbilder werden durch lokale Initialen ersetzt; lokale Bilder bleiben
  möglich. URL-Sonderfälle werden normalisiert und auf externe Herkunft geprüft.
- **Browser und Bedienbarkeit:** das HTML-Sprachattribut folgt dem Sprachwechsel.
  Private Query-Caches werden nach Abmeldung/Kontolöschung geleert. Die
  Kontolöschung hat einen beschrifteten Bestätigungsdialog und Fehlerbehandlung.
- **Sicherheitsheader:** die Webkonfiguration enthält Schutz gegen fremde
  Frames, MIME-Sniffing und ungewollte Geräteberechtigungen sowie eine
  restriktive Referrer-Policy. Die API-Konfiguration fordert für den nächsten
  Vercel-Deploy die Region Frankfurt (`fra1`) an; der reale Deploy bleibt zu prüfen.

## Vor dem Produktivbetrieb noch offen

1. **Hostingverträge und internationale Übermittlungen:** bestätigt sind Vercel
   Hobby und MongoDB Atlas. Die aktuelle Vercel-DPA-Regelung darf nicht einfach
   als bestätigter AVV für Hobby dargestellt werden. Das DPA untersagt zudem
   besondere/sensible Datenkategorien; ein Upgrade allein löst diese Frage nicht.
   Die tatsächliche Vertrags- und Rollenlage muss zu den verarbeiteten Daten passen.
2. **Tatsächliche Regionen, Anbieterlogs und Backups:** Atlas-Region und
   Sicherungsstandorte, Aufbewahrungsfristen, externe Logziele und
   Wiederherstellungsverfahren im Konto prüfen. Kein pauschales EU-only- oder
   Löschfristversprechen aus dem Quellcode ableiten. Die konkreten Dashboardpfade
   und Quellen stehen in [HOSTING-DATENSCHUTZ.md](HOSTING-DATENSCHUTZ.md).
3. **Nach dem Deploy:** HTTPS, Cookieattribute, tatsächlich geladene Ressourcen,
   entfernte Diagnoserouten, Datenexport, Löschung und API-Region in einer
   geeigneten Testumgebung prüfen. Isolierte Tests ersetzen keine Prüfung der
   realen Anbieter- und Datenbankkonfiguration.
4. **Wiederherstellung und Altbestände:** Backups müssen abgeschlossene
   Löschungen berücksichtigen. Anonyme Inhalte und alte Ranglisteneinträge ohne
   Nutzerzuordnung benötigen bei Bedarf eine manuelle Zuordnung. Eine
   Kontolöschung über mehrere Collections ist ohne Transaktionen nicht atomar;
   Grenzen und Fehlerwiederholung sind im Löschplan beschrieben.
5. **Inhalte und Betrieb:** Rechte an hochgeladenen Texten/Bildern sicherstellen,
   Abhängigkeiten aktuell halten, Verwaltungszugänge schützen und Backups samt
   Wiederherstellung testen. Mobile Ansicht und Tastaturbedienung bei weiteren
   Änderungen mitprüfen.

## Cookies und mögliche spätere Zusatzpflichten

Im geprüften Code sind keine Werbetracker oder externen Schrift-CDNs eingebunden.
Notwendige Sessioncookies und die ausdrücklich gewählte Sprache lösen nicht
pauschal eine Bannerpflicht aus. Neue einwilligungspflichtige Dienste müssen vor
Zustimmung blockiert werden und Ablehnung sowie Widerruf ermöglichen.

Wenn später Verkäufe, Buchungen, Abos, Werbung oder Newsletter hinzukommen,
sind die dann einschlägigen Verbraucher-, Werbe- und Barrierefreiheitspflichten
neu zu prüfen. Die private App besitzt derzeit keinen Shop. Ein alter Link zur
aufgehobenen EU-OS-Plattform wurde nicht hinzugefügt.

Quellen: [Impressumspflicht der Medienanstalten](https://www.die-medienanstalten.de/aufgaben/aufsicht/impressumspflicht/),
[DSGVO](https://eur-lex.europa.eu/eli/reg/2016/679/oj?locale=de),
[Website-Datenschutz](https://www.lfd.niedersachsen.de/faq/website_betreiber/faq-webseiten-datenschutzkonform-betreiben-166238.html),
[§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html),
[Vercel-DPA](https://vercel.com/legal/dpa),
[Vercel-Funktionsregionen](https://vercel.com/docs/functions/configuring-functions/region),
[Atlas-Backups](https://www.mongodb.com/docs/atlas/backup-restore-cluster/).
