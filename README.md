# Mindfog

Eine kleine Web-App fuer Task-Priorisierung, mentale Entlastung und einen
realistischen Tagesfokus. Die App laeuft jetzt als kleine Node.js-Anwendung
mit Login, Session-Handling und SQLite-Datenbank.

## Was die App kann

1. Tasks schnell erfassen, ohne zu viele Felder ausfüllen zu müssen.
2. Tasks anhand von Energie, Fokus und Tagesmodus priorisieren.
3. Automatisch eine Top-3 für heute bilden.
4. Punkte für erledigte Tasks sammeln.
5. Ideen separat parken und später aktivieren.
6. Erledigte Tasks über mehrere Zeiträume anzeigen.
7. Zwischen Deutsch und Englisch umschalten.
8. Tasks serverseitig in SQLite speichern und pro Benutzer trennen.

## V1-Prinzipien

- Nicht alles gleichzeitig lösen, sondern Überforderung reduzieren.
- Gute Ideen schützen, ohne den Tag kapern zu lassen.
- Reibung beim Erfassen bewusst klein halten.
- Motivation durch sichtbare Scorepunkte verstaerken.

## Dateien

- `index.html`: Struktur der App
- `styles.css`: Layout und visuelle Sprache
- `app.js`: Frontend-Zustand, Login-Flow und API-Anbindung
- `server.js`: Express-Server, Login, Sessions und SQLite
- `package.json`: Node-Skripte und Abhaengigkeiten

## Nutzung

Die App wird ueber einen lokalen Node-Server gestartet. Beim ersten Start
kannst du direkt den ersten Benutzer anlegen. Danach sind Login und
benutzerbezogene Tasks aktiv.

## Lokaler Workflow

Lokale Vorschau starten:

```bash
./start-local.sh
```

Danach ist die App unter `http://localhost:4173` erreichbar.

Änderungen mit einem Befehl veröffentlichen:

```bash
./publish.sh "Kurze Beschreibung der Aenderung"
```

Das Skript fuehrt `git add .`, `git commit` und `git push` aus.
