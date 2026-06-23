# Deadline Map

![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat&logo=node.js) ![Vue.js](https://img.shields.io/badge/Vue.js-3-green?style=flat&logo=vue.js) ![License](https://img.shields.io/badge/License-ISC-blue?style=flat)

Intelligente Lern- und Deadlineplanung mit Kapazitätsabgleich. Plane deine Aufgaben, definiere deine verfügbare Zeit pro Woche und lass die App berechnen, ob du alles rechtzeitig schaffst.

**Live:** https://deadline-map.onrender.com/

## Quick Start

In weniger als 1 Minute lokal starten:

```bash
npm install
npm run dev
```

Danach im Browser oeffnen: `http://localhost:5173`

Optional fuer Production-Check:

```bash
npm run build
npm run preview
```

## Warum dieses Tool?

Viele ToDo-Apps verwalten nur Listen. Deadline Map optimiert zusaetzlich die **Zeitverteilung**:

- Automatische Verteilung von Aufgaben auf konkrete Tage
- Abgleich zwischen benoetigter Arbeit und realer Tageskapazitaet
- Fruehe Ueberlastungswarnung statt spaeter Deadline-Stress
- Beruecksichtigung von Ausnahmen (z. B. Urlaub, Krankheit, Feiertage)
- Fokus auf Lern- und Pruefungsplanung statt allgemeiner Aufgabenverwaltung

## Demo

Hier sollte ein kurzes GIF/Screenshot eingebunden sein, das zeigt:

1. Aufgabe anlegen
2. Stunden + Deadline setzen
3. Automatische Aktualisierung des Plans

Empfohlener Pfad fuer die Datei:

`docs/assets/deadline-map-demo.gif`

Einbindung in diese README:

```md
![Deadline Map Demo](docs/assets/deadline-map-demo.gif)
```

### GIF-Aufnahme in 3 Szenen (Windows)

Empfohlenes Tool: **ScreenToGif** (kostenlos).

1. **Szene 1 (Aufgabe anlegen, ca. 5-7s)**
	Formular oeffnen, Titel + Stunden + Deadline eintragen, speichern.
2. **Szene 2 (Kapazitaet setzen, ca. 4-6s)**
	Einen Wochentag anpassen, damit sichtbare freie Zeit entsteht.
3. **Szene 3 (Auto-Update zeigen, ca. 4-6s)**
	Plan neu berechnen und den aktualisierten Kalender kurz im Fokus halten.

Empfohlene Aufnahme-/Export-Settings:

- FPS: `12-15`
- Breite: `1200px` (oder kleiner, falls Datei zu gross wird)
- Zielgroesse: unter `8 MB`
- Loop: unendlich

Datei speichern als:

`docs/assets/deadline-map-demo.gif`

Optional (wenn du lieber MP4 nutzt):

```md
<video src="docs/assets/deadline-map-demo.mp4" controls width="100%"></video>
```

## Wie nutzt man das Projekt?

1. **Aufgaben erfassen**: Gib Aufgaben, benötigte Stunden und Deadlines ein.
2. **Kapazitäten definieren**: Lege fest, wie viele Stunden pro Wochentag du verfügbar hast.
3. **Ausnahmen eintragen**: Berücksichtige Urlaub, Krankheit oder Feiertage.
4. **Plan erstellen**: Die App berechnet automatisch einen optimalen Lernplan.
5. **Sehen, ob es passt**: Warnung, wenn deine Zeit nicht ausreicht – rechtzeitig planen statt Panik!

## Was ist Kapazitätsplanung?

Kapazitätsplanung bedeutet, deine **verfügbare Zeit** gegen deine **notwendige Zeit** abzugleichen. Ein klassisches Problem:
- Du hast 3 Prüfungen (20h, 15h, 10h) bis in 2 Wochen.
- Du kannst nur Mo–Fr je 2h lernen = 20h insgesamt.
- Schon Stoff verstanden? → Die App zeigt es direkt!

## Was ist ein Lernplan?

Ein Lernplan ist eine **tagesweise Aufteilung** deiner Aufgaben. Die App sortiert nach Deadline und verteilt die Arbeit auf verfügbare Tage – damit deine Zeit optimal genutzt wird und du Stress vermeidest.

## Table of Contents

| | |
|---|---|
| [Quick Start](#quick-start) | In 60 Sekunden starten |
| [Warum dieses Tool?](#warum-dieses-tool) | USP und Mehrwert |
| [Demo](#demo) | Screenshot/GIF |
| [Tech-Stack](#tech-stack) | Welche Technologien? |
| [Installation](#installation) | Lokal starten |
| [Erste Schritte](#erste-schritte) | Schritt-für-Schritt Setup |
| [Projektstruktur](#projektstruktur) | Wie ist der Code aufgebaut? |
| [Features](#features) | Was kann die App alles? |
| [Roadmap](#roadmap) | Naechste Schritte |
| [Deployment](#deployment) | Live im Internet |

## Tech-Stack

| Bereich | Technologie |
|---|---|
| Frontend | Vue 3, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Persistenz | Browser LocalStorage, JSON Export/Import |
| Sprache | HTML, CSS, JavaScript |
| Hosting | Render |

Hinweis: Die aktuell ausgelieferte Hauptansicht unter `/` ist `deadline_map.html`.

## Installation

Voraussetzung: **Node.js 18+** und **npm**.

```bash
git clone https://github.com/CommitToClock/Deadline-Map.git
cd Deadline-Map
npm install
```

## Erste Schritte

### Schritt 1: Lokal im Dev-Modus starten

```bash
npm run dev
```

Die App öffnet sich unter: `http://localhost:5173`

### Schritt 2: Produktionsbuild testen

```bash
npm run build
npm run preview
```

### Schritt 3: Mit Express-Server starten

```bash
npm start
```

Öffne: `http://localhost:3000`

Der Express-Server liefert unter `/` die aktuelle Standalone-Ansicht aus `deadline_map.html`.

## Projektstruktur

```
Deadline-Map/
├── src/                          # Vue-Komponenten
│   ├── App.vue                   # Hauptkomponente
│   ├── main.js                   # Vue-Einstiegspunkt
│   ├── style.css                 # Globale Stile
│   └── components/
│       └── ResultsSection.vue    # Ergebnisanzeige
├── index.html                    # HTML-Einstiegspunkt (Vue)
├── deadline_map.html             # Primärer Einstieg (aktuelle Hauptansicht)
├── server.js                     # Express-Server
├── package.json                  # Abhängigkeiten
├── vite.config.js                # Vite-Konfiguration
├── tailwind.config.js            # Tailwind-Konfiguration
└── README.md                     # Diese Datei
```

## Features

- ✅ Aufgaben mit Titel, Stunden, Deadline und Priorität
- ✅ Flexible wöchentliche Kapazitäten (pro Wochentag konfigurierbar)
- ✅ Ausnahmetage (Urlaub, Krankheit, Feiertage)
- ✅ Wöchentliche Überrides für spezielle Wochen
- ✅ Automatischer Lernplan-Generator
- ✅ Echtzeit-Kapazitätscheck (Warnung bei Überlastung)
- ✅ Speichern und Laden von Plänen im Browser
- ✅ JSON-Export/Import
- ✅ Dark Mode

## Aktuelles Planungsverhalten

Die Hauptansicht unter `/` ist die Standalone-App in `deadline_map.html`. Dort gelten aktuell folgende Regeln:

1. **Vergangenheit wird nicht neu aufgefuellt**
	Bereits vergangene Tage werden nicht fuer neue automatische Verteilung verwendet.

2. **Erledigte vergangene Slots bleiben reserviert**
	Wenn ein Slot nachtraeglich als erledigt markiert wird, bleibt die Kapazitaet intern blockiert,
	damit der Slot spaeter nicht mit anderen Aufgaben wieder befuellt wird.

3. **Stabile Tagesbelegung bis heute**
	Bereits geplante Einheiten bis einschliesslich heute werden beim Neuberechnen stabil gehalten,
	damit sich nicht bei jeder kleinen Aenderung alte Tage verschieben.

4. **Kapazitaetsanzeige `x/yh`**
	Die Anzeige zeigt die **sichtbaren offenen Stunden** der Zelle (`x`) im Verhaeltnis zur Tageskapazitaet (`y`).
	Interne Reservierungen fuer abgeschlossene Historie zaehlen nicht in `x`.

5. **Farblogik fuer Vergangenheit**
	Vergangene Tage mit historischer Reservierung koennen als `historical-filled` grau erscheinen.
	Vergangene Tage ohne solche Reservierung erscheinen neutral/weiss.

6. **Zukunftstage**
	In Zukunftstagen bleibt `x/yh` sichtbar, auch wenn alle dort angezeigten Tasks erledigt markiert sind.

7. **Warnung fuer offene Vergangenheits-Slots**
	Offene geplante Eintraege vor dem aktuellen Tag werden im Hinweisblock
	"Nicht erledigte Slots in der Vergangenheit" zusammengefasst.

8. **Schwellenwerte der Auslastungsfarben**
	Die Farbstufe folgt der Auslastung pro Tag: unter 50% = `util-low`,
	ab 50% = `util-medium`, ab 100% = `util-full`, ueber 100% = `util-over`.

9. **Sonderfall: Kein verfuegbarer Slot**
	Wenn die Tageskapazitaet 0 ist, aber Aufgaben auf dem Tag liegen,
	wird der Tag als ueberlastet markiert und mit "Kein verfuegbarer Slot" gekennzeichnet.

10. **Ausnahmetage haben Vorrang**
	Liegt ein Datum in einem Ausnahmezeitraum, wird der Tag als `exception-day`
	markiert und entsprechend hervorgehoben.

### Farbstatus im Kalender (Kurzuebersicht)

| Status | Bedeutung | CSS-Klasse |
|---|---|---|
| Gruen | Freie Zeit / geringe Auslastung | `free-time`, `util-low` |
| Gelb | Teilweise belegt / mittlere Auslastung | `partial-time`, `util-medium` |
| Orange | Nahe Vollauslastung | `util-full` |
| Rot | Ueberlastet / kein verfuegbarer Slot | `util-over`, `overloaded` |
| Blau-Grau | Ausnahmetag (z. B. Urlaub, Feiertag) | `exception-day` |
| Weiss (neutral) | Vergangener Tag ohne historische Reservierung | `past-neutral` |
| Grau | Vergangener Tag mit historischer Reservierung | `historical-filled` |

Technische Referenz der Styles: `deadline_map.html` (Klassen im Bereich der `.day-cell`-Zustaende).

## Roadmap

Geplante naechste Schritte (Stand heute):

- Google Calendar Sync (Import/Export relevanter Lernslots)
- Verbesserte mobile Ansicht fuer kleine Displays
- Optionaler Wochen-Optimierer mit Fokuszeiten
- Kollaborative Planung (z. B. Lerngruppen)
- Weitere Exportformate (PDF/ICS)

## Deployment

Die App wird automatisch von **Render** deployt:

- **URL**: https://deadline-map.onrender.com/
- **Trigger**: Jeder Push auf `main` branch
- **Build**: `npm run build`
- **Start**: `npm start` (Express-Server auf Port 3000)

Welche Version ist live?

- Unter `/` wird `deadline_map.html` ausgeliefert.
- Die Vue-App bleibt im Projekt fuer die komponentenbasierte Weiterentwicklung erhalten.

Empfohlene Render-Einstellungen

- Runtime: `Node`
- Node Version: `>=18`
- Build Command: `npm run build`
- Start Command: `npm start`
