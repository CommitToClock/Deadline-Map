# Deadline Map

Live-Demo: https://deadline-map.onrender.com/

Deadline Map ist eine interaktive Web-App zur Lern- und Deadlineplanung. Nutzerinnen und Nutzer tragen Aufgaben, Deadlines, woechentliche Lernzeiten, Ausnahmetage und einmalige Wochenanpassungen ein. Die App berechnet daraus einen Lernplan und zeigt direkt, ob die verfuegbare Zeit bis zu den Deadlines ausreicht.

## Funktionen

- Aufgaben mit benoetigter Zeit, Deadline und Prioritaet erfassen
- Kapazitaeten als Standard-Lernzeiten pro Wochentag pflegen
- Ausnahmetage wie Urlaub, Krankheit oder Pruefungsphasen eintragen
- Automatische Verteilung der Aufgaben auf freie Tage
- Live-Anzeige fuer Zeitmangel, geplante Stunden und freie Restkapazitaeten
- Speichern, Laden, Export und Import der Planungsdaten im Browser
- Dark Mode

## Technologien

- Vue 3
- Vite
- Tailwind CSS
- Express fuer das optionale lokale/produktive Servieren der App
- LocalStorage und JSON-Dateien fuer lokale Datenspeicherung

## Lokal Starten

Voraussetzung: Node.js und npm muessen installiert sein.

```bash
git clone https://github.com/CommitToClock/Deadline-Map.git
cd Deadline-Map
npm install
npm run dev
```

Die Entwicklungsumgebung laeuft danach unter der URL, die Vite im Terminal ausgibt, normalerweise:

```text
http://localhost:5173
```

## Production Build

```bash
npm run build
npm run preview
```

Alternativ kann die App ueber den Express-Server gestartet werden:

```bash
npm start
```

Der Express-Server laeuft standardmaessig unter:

```text
http://localhost:3000
```

## Deployment

Die oeffentliche Version ist hier erreichbar:

https://deadline-map.onrender.com/

Das Repository ist fuer ein Deployment auf Render vorbereitet. Fuer Plattformen wie Render, Vercel oder Netlify reichen typischerweise diese Einstellungen:

- Build command: `npm run build`
- Publish directory: `dist`
- Optionaler Start command fuer Node/Express: `npm start`

## Projektstruktur

```text
.
|-- src/
|   |-- App.vue
|   |-- main.js
|   |-- style.css
|   `-- components/
|       `-- ResultsSection.vue
|-- index.html
|-- deadline_map.html
|-- server.js
|-- package.json
|-- tailwind.config.js
`-- vite.config.js
```

## Hinweise

Die Planungsdaten bleiben lokal im Browser der nutzenden Person. Beim Export wird eine JSON-Datei erzeugt, die spaeter wieder importiert werden kann.

Im Bereich `Kapazitaeten` werden die Standard-Slots fuer die Wochentage gepflegt. Aenderungen werden historisiert: Jeder geaenderte Slot-Stand wird mit einem `gueltig ab`-Datum gespeichert. Der Kalender nutzt fuer vergangene Tage die damals gueltige Kapazitaet und haelt geplante Lernzeit fuer vergangene Tage als Snapshot fest, damit spaetere Slot-Aenderungen alte Planungstage nicht ueberschreiben. Nicht erledigte Stunden aus vergangenen Snapshots werden als Restaufwand erkannt und in die zukuenftige Planung uebernommen.
