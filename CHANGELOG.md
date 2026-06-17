# Changelog

Alle nennenswerten Änderungen an Töff Deal Scout.

## 0.3.0 — Council-Runden R39–R58 (Shopify-Style Redesign)

Die Startseite wurde zu einer vollwertigen Marketing-Landingpage ausgebaut.

- **Announcement-Bar** über dem Header
- **Zweispaltiger Hero** mit Produkt-Visual (Deal-Vorschau-Karte, schwebende Badges)
- **Trust-Leiste** (Quellen) und dunkles **Statistik-Band**
- **Alternierende Feature-Blöcke** mit eigenen SVG-Illustrationen
- **Stepper**, **Testimonials**, aufgewertete **Pricing-Cards** (Empfohlen hervorgehoben), **FAQ**
- Große **Final-CTA** mit Verlauf; **Mega-Footer** (Spalten, Newsletter, Social)
- **Live-Beispiel-Report** unter `#/report/demo` (ohne gespeicherte Daten)
- Report-**KPI-Leiste** (Produktseiten-Gefühl)
- Design-System: Spacing-/Elevation-Tokens (`--shadow-lg`), Button-Varianten
  (`btn-lg`, `btn-secondary`), Dark-Mode-Feinschliff, Screen-Reader-Headings

## 0.2.0 — Council-Runden R1–R38

Iterative Verbesserung durch einen „Council" (Design, Motion, Architektur,
Accessibility, UX-Writing, Performance, Conversion, QA).

### Design & Motion
- Warmer **Hybrid-Look** mit Serif-Headlines (Fraunces), Orange-Akzent
- Sticky, beim Scrollen verdichtende **Blur-Kopfzeile**; Hero-Glow + Parallax
- **Motion-Layer** (Page-In, Scroll-Reveals, Count-up, aufziehende Charts),
  **lazy** beim Sichtbarwerden, `prefers-reduced-motion`-konform
- Button-Press-Feedback, animierte Nav-Unterstreichung

### Zugänglichkeit
- `<main>`-Landmark, Skip-Link, `aria-current`/`aria-pressed`, `:focus-visible`
- Formular: Fehler-Zusammenfassung (`role=alert`, Sprung zum Feld), `aria-invalid`,
  Chip-Gruppenrollen; Route-Ansage für Screenreader; `forced-colors`-Support

### Formular & Conversion
- Live-**Fortschrittsbalken**, klebriger Submit auf Mobile
- **Entwurf-Autosave/Resume**, Budget-Autokorrektur, zuletzt genutztes Land/Region

### Admin
- Dashboard: KPIs (Count-up), Status-Donut, Paket-/Länder-Bars, letzte Aktivität
- Liste: Suche (entprellt), Statusfilter, **sortierbare Spaltenköpfe** (`aria-sort`),
  **Pagination**, Klick-Delegation; Filter/Suche/Sortierung **persistent**
- Detail: Status ändern + „Weiter"-Button, interne Notizen, Status-Verlauf
- **Undo** bei Löschen/Leeren (Soft-Delete im Store), CSV-/JSON-Export, JSON-Import

### Report (Scout-Engine)
- Deterministische Deal-Engine: Score-Gauge, Risiko, Marktwert, Verhandlung,
  Checkliste, Verkäuferfragen; **„Bestes Angebot"**-Hervorhebung
- Zusammenfassung in die Zwischenablage kopieren; druckbarer Report-Kopf

### Plattform & Qualität
- 3-Wege-**Theme** (System/Hell/Dunkel), **Dichte**-Umschalter (Komfortabel/Kompakt)
- **Toasts** mit Aktions-Button (Undo); globaler Fehler-Fänger
- **PWA**: Service Worker v2 mit Offline-Navigation, theme-color je Schema,
  apple-touch-icon; **SEO** via JSON-LD/Meta
- Landing: **Preisvergleich** & **FAQ**
- Architektur: geschichtet (core/data/services/components), Layout-Vertrag (DRY),
  geteilte Module `core/dom`, `data/demo`
- Tests: 31 Unit-Tests + Render-Smoke; `npm test` führt beide aus

## 0.1.0 — MVP
- Erste klickbare Version: Landing, Formular, Erfolg, Admin, Report-Mockup;
  LocalStorage-Persistenz; Scout-Engine; Dashboard; PWA; Test-Suite.
