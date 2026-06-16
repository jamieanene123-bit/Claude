# Töff Deal Scout — Web-App (MVP)

Erste klickbare Frontend-Version des Töff Deal Scout. Reines Frontend,
**kein Backend, kein Login, keine Zahlung, keine externe API**. Anfragen
werden im **LocalStorage** des Browsers gespeichert.

## Sofort testen

Keine Installation, kein Build-Schritt nötig:

```
index.html im Browser öffnen (Doppelklick genügt)
```

Optional über einen lokalen Server (empfohlen, sauberere URLs/Reload):

```
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

## Seiten / Routen

Die App nutzt einen Hash-Router (läuft ohne Server direkt über `file://`):

| Route            | Seite                                            |
|------------------|--------------------------------------------------|
| `#/`             | Landingpage mit Erklärung                        |
| `#/form`         | Suchanfrage-Formular                             |
| `#/success/:id`  | Erfolgsseite nach dem Absenden                   |
| `#/admin`        | Admin: Liste aller Anfragen + Status-Filter      |
| `#/admin/:id`    | Admin: Detailansicht, Status ändern              |
| `#/report/:id`   | Report-Mockup mit 3 Beispiel-Deals               |

## Bedienung

1. **Anfrage stellen:** `#/form` ausfüllen → wird lokal gespeichert (Status „Neu").
2. **Admin:** `#/admin` zeigt alle Anfragen. Nach Status filtern, Zeile anklicken
   für Details, Status umstellen (Neu → In Prüfung → Report erstellt → Abgeschlossen).
3. **Report:** Aus Detail oder Erfolgsseite öffnen — Mockup mit 3 Deal-Karten.

Im Admin gibt es **„Beispieldaten laden"** und **„Alle löschen"** für schnelles Demo.

## Projektstruktur

```
index.html                 Einstieg, lädt alle Skripte
css/styles.css             gesamtes Design (auf Original-Formular aufgebaut)
js/
  config.js                Regionen, Budgets, Pakete, Status (zentral)
  store.js                 Datenschicht (LocalStorage, Promise-basiert)
  router.js                Hash-Router
  app.js                   Routen-Registrierung & Start
  components/
    layout.js              Header, Footer, Helfer (esc, Datum, Status-Badge)
    landing.js             Startseite
    form.js                Suchanfrage-Formular + Validierung
    success.js             Erfolgsseite
    admin.js               Admin-Liste + Detail
    report.js              Report-Mockup
```

## Bewusst erweiterbar gehalten

Die Architektur ist auf spätere Ausbaustufen vorbereitet, ohne jetzt zu
überengineeren:

- **Backend:** Nur `js/store.js` austauschen. Die Methoden (`list`, `get`,
  `create`, `updateStatus`, `remove`) sind bereits Promise-basiert — der Body
  kann 1:1 auf `fetch()` umgestellt werden, Views bleiben unverändert.
- **Login/Auth:** In `js/app.js` vor den Admin-Routen einen Guard einsetzen
  (Markierung im Code vorhanden).
- **Stripe/TWINT:** Im Submit-Handler von `js/form.js` nach `store.create()`
  einen Checkout-Redirect ergänzen.

## Datenmodell (LocalStorage-Key `tds_requests_v1`)

```json
{
  "id": "TDS-AB12CD",
  "createdAt": "2026-06-16T13:00:00.000Z",
  "status": "Neu",
  "values": { "vorname": "...", "nachname": "...", "...": "..." }
}
```
