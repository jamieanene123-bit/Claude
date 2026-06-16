# CLAUDE.md

Hinweise für die Arbeit an diesem Repository.

## Projekt

**Töff Deal Scout** — Frontend-MVP einer Motorrad-Kaufberatung. Nutzer senden
eine Suchanfrage ab; ein Admin verwaltet Anfragen; pro Anfrage wird ein
Deal-Report generiert. Reines Frontend: **kein Backend, kein Login, keine
Zahlung, keine externe API.** Persistenz über LocalStorage.

## Wichtig

- **Kein Build-Schritt.** Klassische `<script>`-Dateien, globaler Namespace
  `window.TDS`. App läuft per Doppelklick auf `index.html` (auch `file://`).
- **Ladereihenfolge** ist relevant — siehe `index.html`. Reihenfolge:
  `core/ → data/ → services/ → router → components/ → app.js`.
  Neue Datei? Script-Tag an passender Stelle ergänzen **und** (falls offline
  relevant) in `sw.js` aufnehmen.
- **Vanilla ES5-Stil** im App-Code (IIFE, `var`, keine Module/JSX).
  Test-Code darf moderne Syntax nutzen.
- **HTML aus Nutzerdaten** immer mit `TDS.ui.esc(...)` escapen.
- **Formatierung** (Währung/Datum/km) zentral über `TDS.format`.

## Befehle

```
npm test         # Headless-Tests (node tests/node.js) — muss grün sein
npm start        # lokaler Server auf :8000 (python3 http.server)
```

Im Browser: `tests.html` öffnen für die visuelle Test-Übersicht.

## Vor dem Commit

1. `npm test` läuft grün (22+ Tests).
2. Bei JS-Änderungen kurzer Syntaxcheck: `node --check <datei>`.
3. Neue Views in `app.js` registrieren und in `index.html` einbinden.

## Wo was liegt

- Stammdaten/Katalog → `js/data/`
- Persistenz/Engine → `js/services/`
- Wiederverwendbares (Format, Charts, Events, Theme, Toast) → `js/core/`
- Seiten/Views → `js/components/`
- Architektur & Erweiterungspfade → `ARCHITECTURE.md`
