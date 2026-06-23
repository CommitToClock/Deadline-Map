# Deadline Map

![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat&logo=node.js) ![Vue.js](https://img.shields.io/badge/Vue.js-3-green?style=flat&logo=vue.js) ![License](https://img.shields.io/badge/License-ISC-blue?style=flat)

Intelligente Lern- und Deadlineplanung mit Kapazitätsabgleich. Plane deine Aufgaben, definiere deine verfügbare Zeit pro Woche und lass die App berechnen, ob du alles rechtzeitig schaffst.

**Live:** https://deadline-map.onrender.com/

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

Ein Lernplan ist eine **tagesweise Aufteilung** deiner Aufgaben. Die App sortiert nach Priorität und Deadline und verteilt die Arbeit auf verfügbare Tage – damit deine Zeit optimal genutzt wird und du Stress vermeidest.

## Table of Contents

| | |
|---|---|
| [Tech-Stack](#tech-stack) | Welche Technologien? |
| [Installation](#installation) | Lokal starten |
| [Erste Schritte](#erste-schritte) | Schritt-für-Schritt Setup |
| [Projektstruktur](#projektstruktur) | Wie ist der Code aufgebaut? |
| [Features](#features) | Was kann die App alles? |
| [Deployment](#deployment) | Live im Internet |

## Tech-Stack

- **Frontend**: Vue 3 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Speicher**: Browser LocalStorage + JSON-Export/Import
- **Entwicklung**: HTML, CSS, JavaScript

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
├── deadline_map.html             # Standalone HTML (All-in-One)
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

## Deployment

Die App wird automatisch von **Render** deployt:

- **URL**: https://deadline-map.onrender.com/
- **Trigger**: Jeder Push auf `main` branch
- **Start**: `npm start` (Express-Server auf Port 3000)
