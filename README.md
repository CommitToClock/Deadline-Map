# Deadline Map

Deadline Map ist eine Web-Anwendung zur Lern- und Deadlineplanung. Aufgaben werden mit Aufwand und Deadline erfasst, mit woechentlichen Zeitkapazitaeten abgeglichen und automatisch auf verfuegbare Tage verteilt.

## Oeffentliche Version

Die aktuelle finale Version ist verfuegbar unter:

https://deadline-map.onrender.com/

(Deployed auf Render mit automatischer Synchronisation von GitHub main branch)

## Was das Projekt loest

- Erfasst Aufgaben mit Titel, Aufwand, Deadline und Prioritaet
- Beruecksichtigt Ausnahmetage (z.B. Urlaub, Krankheit, Feiertage)
- Nutzt regulaere Wochenkapazitaeten sowie einmalige Wochen-Overrides
- Zeigt direkt, ob die eingeplante Zeit bis zur Deadline ausreicht
- Ermoeglicht Speichern/Laden sowie JSON-Export/Import im Browser

## Verwendete Technologien

- HTML, CSS, JavaScript
- Vue 3 (Vite-Basis im Projekt vorhanden)
- Tailwind CSS
- Node.js + Express (optional zum lokalen Servieren)

## Lokale Ausfuehrung

Voraussetzung: Node.js 18+ und npm.

```bash
git clone https://github.com/CommitToClock/Deadline-Map.git
cd Deadline-Map
npm install
```

Entwicklung mit Vite:

```bash
npm run dev
```

Produktionsbuild testen:

```bash
npm run build
npm run preview
```

Alternative mit Express-Server:

```bash
npm start
```

Standard-URL bei Express:

```text
http://localhost:3000
```

## Deployment

Die aktuelle Version wird automatisch von Render deployt:

- URL: https://deadline-map.onrender.com/
- Trigger: Jeder Push auf `main` branch loest einen neuen Deploy aus
- Server: Express-basiert, startet mit `npm start` auf Port 3000
