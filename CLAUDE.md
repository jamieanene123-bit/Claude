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
npm test         # Unit-Tests (tests/node.js) + Render-Smoke (tests/smoke.js)
npm run test:unit  # nur Unit-Tests
npm run smoke      # nur Render-Smoke (lädt alle Module headless, rendert alle Views)
npm start          # lokaler Server auf :8000 (python3 http.server)
```

Im Browser: `tests.html` öffnen für die visuelle Test-Übersicht.

## Konventionen, die leicht vergessen gehen

- **Views liefern nur Content.** `TDS.ui.render(content)` ergänzt zentral Header,
  `<main>`-Landmark und Footer. KEIN `ui.header()/ui.footer()` mehr in Views.
- **Bewegung** ist zentral in `core/motion.js` (läuft via `render()`); Views
  brauchen nichts zu tun. `prefers-reduced-motion` wird respektiert.
- **Datei-Download** über `TDS.dom.download(...)`, **Demo-Daten** über
  `TDS.data.demo.samples()` — nicht duplizieren.
- HTML aus Nutzerdaten immer mit `TDS.ui.esc(...)` escapen; Formatierung über `TDS.format`.

## Vor dem Commit

1. `npm test` läuft grün (Unit + Smoke).
2. Bei JS-Änderungen kurzer Syntaxcheck: `node --check <datei>`.
3. Neue Datei? Script-Tag in `index.html` an passender Stelle **und** (falls
   offline relevant) in `sw.js` ergänzen. Neue View in `app.js` registrieren.

## Wo was liegt

- Wiederverwendbares (Events, Format, Charts, Theme, Toast, Motion, DOM-Helfer) → `js/core/`
- Stammdaten/Katalog/Demo → `js/data/`
- Persistenz/Engine → `js/services/`
- Seiten/Views → `js/components/`
- Tests → `tests/` (`node.js` = Unit, `smoke.js` = Render)
- Architektur & Erweiterungspfade → `ARCHITECTURE.md`
