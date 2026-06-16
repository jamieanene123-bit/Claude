# Architektur

Schlanke, geschichtete Frontend-App ohne Build-Schritt. Klassische
`<script>`-Dateien unter einem globalen Namespace `window.TDS`, damit die App
direkt per Doppelklick auf `index.html` (auch über `file://`) läuft —
gleichzeitig sauber in Schichten getrennt.

## Schichten

```
┌─────────────────────────────────────────────────────────────┐
│  components/  (Views: rendern HTML-Strings nach #app)          │
│  landing · form · success · admin · report · settings · 404   │
└───────────────▲───────────────────────────────▲──────────────┘
                │ nutzt                          │ nutzt
┌───────────────┴───────────┐        ┌───────────┴──────────────┐
│  services/                │        │  core/                    │
│  store  (Repository)      │        │  events · format · charts │
│  scout  (Scoring-Engine)  │        │  theme · toast            │
└───────────────▲───────────┘        └───────────────────────────┘
                │ nutzt
┌───────────────┴───────────┐
│  data/  config · market    │   (Stammdaten / Katalog)
└────────────────────────────┘

router.js  → Hash-Routing            app.js → Bootstrap & Verdrahtung
```

**Abhängigkeitsregel:** Views → Services/Core → Data. Keine Rückwärts-Kopplung.
Die Ladereihenfolge in `index.html` spiegelt das wider.

## Schlüsselentscheidungen

| Thema            | Entscheidung & Begründung                                            |
|------------------|---------------------------------------------------------------------|
| Kein Build       | Klassische Skripte + `TDS`-Namespace → sofort lauffähig, kein Tooling|
| Routing          | Hash-Router (`#/admin`) → funktioniert ohne Server (`file://`)       |
| Persistenz       | `services/store.js` mit **Adapter** (LocalStorage ↔ Memory ↔ später REST) |
| Reaktivität      | `core/events.js` EventBus (`data:change`)                            |
| Daten-Engine     | `services/scout.js` rein & deterministisch (seeded RNG) → testbar    |
| Tests            | Eigenes Mini-Framework, läuft in Browser **und** Node               |
| Charts           | Inline-SVG/CSS in `core/charts.js`, keine externe Lib               |

## Datenmodell (LocalStorage `tds_db_v2`)

```jsonc
{
  "v": 2,
  "requests": [
    {
      "id": "TDS-AB12CD",
      "createdAt": "2026-06-16T13:00:00.000Z",
      "updatedAt": "2026-06-16T13:05:00.000Z",
      "status": "In Prüfung",
      "values": { "vorname": "…", "stil": ["Naked Bike"], "paket": "Scout", "…": "…" },
      "history": [ { "status": "Neu", "at": "…" }, { "status": "In Prüfung", "at": "…" } ],
      "notes":   [ { "text": "Rückruf vereinbart", "at": "…" } ]
    }
  ]
}
```

Migration von der MVP-Version (`tds_requests_v1`, reines Array) passiert
automatisch beim ersten Laden.

## Scout-Engine (services/scout.js)

`generate(record) → { deals, summary }`

1. **Constraints** aus der Anfrage ableiten (Stil, A2-Pflicht, Budget, Baujahr, max. km, Wunschmodell, Region/Währung).
2. **Kandidaten** aus `data/market.js` wählen (Stil-/A2-Filter, Fit-Ranking nach Budgetnähe, Zuverlässigkeit, Modelltreffer).
3. Pro Kandidat ein **Listing synthetisieren** (Jahr, km, Zustand, Verkäufer) — deterministisch über einen aus der Anfrage-ID geseedeten RNG (`cyrb53` → `mulberry32`).
4. **Bewerten**: Marktwert (Depreciation × km × Zustand) → Deal-Score, Risiko, Empfehlung, Verhandlungsargumente, Besichtigungs-Checkliste, Verkäuferfragen.

Gleiche ID ⇒ identischer Report. Keine echten Inserate.

## Erweiterungspfade

- **Backend:** In `services/store.js` einen `RestAdapter` (fetch) bauen und via `store._useAdapter(...)` setzen. Die Promise-API bleibt gleich, Views unverändert.
- **Login/Auth:** In `app.js` vor den Admin-/Settings-Routen einen Guard einsetzen (Markierung im Code).
- **Stripe/TWINT:** Im Submit-Handler von `components/form.js` nach `store.create()` einen Checkout-Redirect ergänzen (`paket` liegt am Datensatz).
- **Echte Inserate:** `data/market.js` + `services/scout.js` durch API-Aufrufe/Preisindex ersetzen — die View `report.js` konsumiert nur das `{deals, summary}`-Format.
