# Hosting und Datenschutz: noch zu bestätigen

Stand: 4. November 2026. Bestätigt sind Vercel im kostenlosen Hobby-Tarif und
MongoDB Atlas. Die zugehörigen Kontoeinstellungen und Vertragsunterlagen wurden
nicht eingesehen. Diese Datei dokumentiert deshalb konkrete offene Angaben,
keine Zusicherung einer abgeschlossenen Datenschutzprüfung.

## Wo die Angaben stehen

| Angabe | Stand für InkInk | Wo prüfen |
| --- | --- | --- |
| Vercel-Tarif | Hobby, vom Betreiber bestätigt | Team-Dashboard: Tarif-/Abrechnungsübersicht. |
| Region der API-Funktionen | In `api/vercel.json` für den nächsten Deploy auf Frankfurt (`fra1`) gesetzt; aktueller Deploy unbestätigt | API-Projekt öffnen, dann **Settings → Functions** und den tatsächlichen Deploy prüfen. Die API-Region ist von der weltweiten Auslieferung statischer Dateien und möglichen weiteren Anbieter-Verarbeitungen zu unterscheiden. |
| Vercel-Protokolle | Tatsächliche Einstellungen offen | Im jeweiligen Projekt **Logs** und **Observability** prüfen; auch zusätzliche Integrationen und Log Drains berücksichtigen. |
| Vercel-Datenpräferenzen | Offen | **Team Settings → Data Preferences**. Den Status freiwilliger Nutzung von Code/Agent-Chats und weiterer beschriebener Daten für Modelltraining prüfen und dokumentieren. |
| Atlas-Cluster, Cloudanbieter, Tarif und Region | Offen | Atlas öffnen, Organisation und Projekt wählen, dann **Database → Clusters**. Die Clusterübersicht nennt Region und Tarif; Details beziehungsweise **Edit configuration → Cloud Provider & Region** zeigen die gewählte Konfiguration. Zum Nachsehen müssen keine Änderungen gespeichert werden. |
| Atlas-Sicherungen | Offen | Beim Cluster **Backup** und die Sicherungsrichtlinie öffnen: aktivierte Sicherungen, Speicherregionen, Zeitplan, Aufbewahrungsdauer und zusätzliche Snapshot-Kopien notieren. Funktionen unterscheiden sich nach Clustertarif. |
| Atlas-/externe Protokollierung | Offen | Tatsächlich aktivierte Audit-, Datenbank- und Exportfunktionen sowie externe Logziele prüfen. |
| Vertragsunterlagen | Nicht bestätigt | Aktuelle Vercel-Vertragslage für **Hobby** und die zum Atlas-Konto gehörenden Cloud-Vertragsunterlagen/DPA prüfen. Dokumentversion und Geltungsbereich festhalten. |

Anleitungen: [Vercel-Projekteinstellung für Funktionsregionen](https://examples.vercel.com/academy/vercel-foundations/vercel-account-setup),
[Vercel-Konfiguration und mögliche Regionsüberschreibungen](https://vercel.com/docs/project-configuration/vercel-json),
[Vercel Runtime Logs](https://vercel.com/docs/logs/runtime),
[Vercel-Datenpräferenzen](https://vercel.com/legal/privacy-notice),
[Atlas-Clusterübersicht](https://learn.mongodb.com/learn/course/mongodb-atlas-administration/lesson-2-cluster-status-and-health/learn),
[Atlas Cloud Provider & Region](https://www.mongodb.com/docs/atlas/cluster-config/multi-cloud-distribution/),
[Atlas-Sicherungen und Aufbewahrung](https://www.mongodb.com/docs/atlas/backup/cloud-backup/scheduling/).

Die aktuelle Runtime-Logs-Dokumentation nennt für Hobby eine Stunde
Aufbewahrung. Das bestätigt weder die vollständige InkInk-Konfiguration noch
eine einheitliche Frist für alle Sicherheits-, Build-, Diagnose- oder
weitergeleiteten Protokolle. Deshalb wurde keine pauschale Ein-Stunden-Zusage
für sämtliche Daten in die Datenschutzerklärung übernommen.

## Vercel Hobby und die Vertragsgrundlage

Das [Vercel Data Processing Addendum](https://vercel.com/legal/dpa), Fassung vom
17. März 2026, beschreibt seine Geltung als Auftragsverarbeitungsvereinbarung
für Pro und Enterprise (§ 1 und § 4). Daraus folgt keine Bestätigung, dass für
das verwendete Hobby-Konto derselbe AVV abgeschlossen ist. Der tatsächliche
Vertrag und die Rollenverteilung für den konkreten Betrieb sind zu prüfen;
ein Link auf das DPA allein ersetzt diese Prüfung nicht.

Außerdem untersagt Schedule 1, Abschnitt 6(a) des DPA besondere Kategorien und
sensible Daten in Customer Data. Das ist eine konkrete Vertragsklausel, keine
pauschale rechtliche Einordnung jedes Gefühlswertes. Freitext in Feelink kann
jedoch Gesundheitsinformationen enthalten. Eine Art.-9-Einwilligung im Produkt
hebt Anbieterbedingungen nicht auf; ein Upgrade allein beseitigt diese Frage
ebenfalls nicht.

Die [Vercel-Nutzungsbedingungen](https://vercel.com/legal/terms) (§ 3) nennen für
Hobby/Trial eine standardmäßig aktivierte Möglichkeit zum Modelltraining auf
bestimmten bereitgestellten Inhalten und einen Opt-out in den Team-Einstellungen.
Die Anbieterinformationen beschreiben dabei unter anderem Code, Agent-Chats und
Telemetrie. Daraus wird hier ausdrücklich nicht abgeleitet, dass alle
InkInk-Nutzereinträge automatisch als Trainingsdaten verwendet werden. Der
tatsächliche Umfang und die Kontoeinstellung müssen geprüft werden.

## Konsequenzen für Feelink und die Datenschutzhinweise

- Neue Gefühlseinträge bleiben ohne ausdrückliche Freischaltung standardmäßig
  in allen Umgebungen ausgeschaltet.
  `FEELINGS_ENABLED` darf erst nach Klärung einer geeigneten Hosting- und
  Vertragskonfiguration ausdrücklich aktiviert werden.
- Die vorbereitete Einwilligung gilt pro Eintrag; Fassung und Zeitpunkt werden
  beim Eintrag dokumentiert. Diese Produktfunktion ersetzt keine Prüfung der
  Empfänger, internationalen Übermittlungen und Sicherheitsmaßnahmen.
- In der Datenschutzerklärung bisher keine konkrete Serverregion, keinen
  abgeschlossenen AVV und keinen verifizierten Transfermechanismus behaupten.
  Anbieter und im Code erkennbare Verarbeitungen sind benannt. Der sichtbare
  Hinweis auf noch zu ergänzende Angaben bleibt bestehen, bis die Fakten
  vorliegen.
- Nach Bestätigung die tatsächlichen Empfängerrollen, Staaten, gegebenenfalls
  einschlägigen Übermittlungsgrundlagen und die Möglichkeit ergänzen, Kopien
  relevanter Garantien zu erhalten. Eine EU-Funktionsregion allein belegt nicht,
  dass Support, Unterauftragnehmer und sämtliche weitere Verarbeitung nur im
  EWR stattfinden.
- Für Sicherungen das tatsächliche Ablaufdatum und ein Verfahren festlegen,
  damit gelöschte Nutzerdaten nach einer Wiederherstellung nicht versehentlich
  wieder dauerhaft aktiv werden. Bestehende Sicherungen wurden in dieser
  Aufgabe weder verändert noch gelöscht.

## MongoDB Atlas und Kontakt-E-Mail

Das [MongoDB DPA](https://www.mongodb.com/legal/data-processing-agreement) wird
laut eigener Einleitung in den jeweiligen Cloudvertrag einbezogen. Ob und in
welcher Fassung es für das verwendete Konto gilt, ist anhand dieser Unterlagen
festzuhalten; eine gesonderte Unterschrift ist nicht pauschal als fehlend
anzunehmen. Ebenso sind Cluster- und Backupregionen tatsächlich zu prüfen.

Die angegebene Kontaktadresse ist ein Gmail-Postfach. Kontaktanfragen werden
damit ebenfalls bei Google verarbeitet. Das ist in den Datenschutzhinweisen
benannt; die konkrete Vertrags- und Kontokonfiguration bleibt eine zusätzliche
Betreiberaufgabe. Sensible Nutzerinhalte gehören nicht ungeprüft in Support-Logs
oder frei weitergeleitete E-Mails.

Quellen: [Google-Datenschutzerklärung](https://policies.google.com/privacy?hl=de),
[DSGVO](https://eur-lex.europa.eu/eli/reg/2016/679/oj?locale=de),
[Datenschutzinformationen für Websitebetreiber](https://www.lfd.niedersachsen.de/faq/website_betreiber/faq-webseiten-datenschutzkonform-betreiben-166238.html).
