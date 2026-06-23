# Deadline Map

Deadline Map ist eine Web-Anwendung zur Lern- und Deadlineplanung. Aufgaben werden mit Aufwand und Deadline erfasst, mit woechentlichen Zeitkapazitaeten abgeglichen und automatisch auf verfuegbare Tage verteilt.

## Oeffentliche Version

Finale Version (GitHub Pages):

https://committoclock.github.io/Deadline-Map/

Hinweis: Wenn dort eine aeltere Version angezeigt wird, einmal mit `Ctrl+F5` hart neu laden (Browser-Cache).

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

Das Repository enthaelt einen GitHub-Actions-Workflow fuer GitHub Pages. Bei Push auf `main` wird die finale Standalone-Seite automatisch veroefentlicht.

- Workflow: `.github/workflows/deploy-pages.yml`
- Ziel-URL: `https://committoclock.github.io/Deadline-Map/`

## Repository-Hygiene

Folgende unnoetige Artefakte sind per `.gitignore` ausgeschlossen:

- `node_modules/`
- `dist/`
- lokale Editor-/Temp-/Log-Dateien

Damit bleibt das Repository fuer die finale Abgabe schlank und nachvollziehbar.
