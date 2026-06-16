# Töff Deal Scout — Web-App

Klickbare Frontend-App für eine **Motorrad-Kaufberatung (Deal-Scout)**.
Nutzer senden eine Suchanfrage ab, ein Admin verwaltet sie, und pro Anfrage
wird ein datengetriebener **Deal-Report** erzeugt.

Reines Frontend — **kein Backend, kein Login, keine Zahlung, keine externe
API.** Persistenz über **LocalStorage**. Kein Build-Schritt.

## Sofort starten

```bash
# Variante A: einfach index.html im Browser öffnen (Doppelklick)

# Variante B: lokaler Server (empfohlen — saubere URLs, PWA aktiv)
npm start          # http://localhost:8000   (nutzt python3 http.server)
```

## Tests

```bash
npm test           # Unit-Tests + Render-Smoke (alle Views headless)
npm run test:unit  # nur Unit-Tests (tests/node.js)
npm run smoke      # nur Render-Smoke (tests/smoke.js)
```

Oder visuell: `tests.html` im Browser öffnen.

## Seiten / Routen

Hash-Router (läuft ohne Server, auch über `file://`):

| Route             | Seite                                                        |
|-------------------|-------------------------------------------------------------|
| `#/`              | Landingpage mit Erklärung & Ablauf                          |
| `#/form`          | Suchanfrage-Formular (mit Entwurf-Autosave)                 |
| `#/success/:id`   | Erfolgsseite nach dem Absenden                              |
| `#/admin`         | Admin-Dashboard: KPIs, Charts, Such-/Filter-/Sortier-Liste |
| `#/admin/:id`     | Detail: Stammdaten, Status, Notizen, Verlauf               |
| `#/report/:id`    | Deal-Report mit Score, Risiko, Verhandlungsargumenten      |
| `#/settings`      | Design (Hell/Dunkel) & Datenverwaltung                     |

## Features

**Nutzer**
- Vollständiges Suchanfrage-Formular (alle Felder des Originals) mit Validierung
- Automatischer **Entwurf-Speicher** (Wiederherstellen nicht abgeschickter Eingaben)
- Erfolgsseite mit Anfrage-Nummer und direktem Report-Link

**Admin**
- Dashboard mit **KPIs** und **Charts** (Status-Donut, Paket-Balken — reines SVG/CSS)
- Liste mit **Volltextsuche**, **Statusfilter** und **Sortierung**
- Detailansicht mit **Statuswechsel**, **internen Notizen** und **Status-Verlauf** (Audit-Trail)
- **Export** als CSV und JSON, **Import** per JSON, Beispieldaten & „Alle löschen"

**Report (Scout-Engine)**
- Echte **Deal-Scoring-Engine** statt fixer Texte: berechnet Deal-Score (0–10),
  Risiko, Marktwert-Abweichung und Empfehlung aus einem Motorrad-Markt-Datensatz
- Berücksichtigt Budget, Stil, Wunschmodell, **A2-Tauglichkeit**, Baujahr & max. km
- **Deterministisch** pro Anfrage (gleiche ID → gleicher Report)
- Pro Deal: Verhandlungsargumente, Besichtigungs-Checkliste, Verkäuferfragen
- **Druckbar** (Drucken / als PDF speichern) mit eigenem Print-Layout
- Paket steuert die Anzahl Deals (Quick-Check 1 · Scout 3 · Premium 5)

**Design & Bewegung ("smooth")**
- Warmer **Hybrid-Look** mit Serif-Headlines (Fraunces) und Orange-Akzent
- Sticky, beim Scrollen verdichtende **Blur-Kopfzeile**
- Sanfte **Page-Transitions**, **Scroll-Reveals**, Count-up-KPIs, aufziehende Charts
- Respektiert `prefers-reduced-motion`

**Zugänglichkeit & Funnel**
- `<main>`-Landmark, Skip-Link, `aria-current`/`aria-pressed`, sichtbarer Tastatur-Fokus
- Live-**Fortschrittsbalken** im Formular, klebriger Submit auf Mobile

**Plattform**
- **Dark-/Light-Mode** (persistiert, folgt System-Einstellung)
- **Toast**-Benachrichtigungen
- **PWA**: installierbar & offline (Service Worker, aktiv über http)
- Mobile responsive, Tabellen werden auf kleinen Screens zu Karten

## Projektstruktur

```
index.html · tests.html · manifest.json · sw.js · favicon.svg
css/styles.css
js/
  core/      events · format · charts · theme · toast · motion · dom
  data/      config (Regionen/Pakete/Status) · market (Katalog) · demo (Beispiele)
  services/  store (Repository + Adapter) · scout (Scoring-Engine)
  components/ layout · landing · form · success · admin · report · settings · notfound
  router.js · app.js
tests/       framework · suite · node (Unit-Runner) · smoke (Render-Runner)
```

Details & Erweiterungspfade (Backend, Login, Stripe): siehe
[`ARCHITECTURE.md`](ARCHITECTURE.md). Änderungsverlauf: [`CHANGELOG.md`](CHANGELOG.md).

## Bewusst erweiterbar

- **Backend:** `RestAdapter` in `services/store.js` ergänzen und via
  `store._useAdapter(...)` setzen — Promise-API & Views bleiben unverändert.
- **Login/Auth:** Guard in `app.js` vor den Admin-/Settings-Routen einsetzen.
- **Stripe/TWINT:** im Submit-Handler von `components/form.js` nach
  `store.create()` einen Checkout-Redirect ergänzen.
- **Echte Inserate:** `data/market.js` + `services/scout.js` durch
  API/Preisindex ersetzen; `report.js` konsumiert nur `{ deals, summary }`.

> Hinweis: Der Report nutzt **synthetische** Beispiel-Inserate (kein echter
> Marktzugriff). Daten liegen ausschliesslich lokal im Browser.
