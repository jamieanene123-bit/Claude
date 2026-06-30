# Arbeitszeugnisgenerator (lokales MVP)

Ein **komplett lokal** laufendes Tool (Schweiz, Deutsch), das aus einer Excel-
Satzdatenbank passende Arbeitszeugnis-Textbausteine nach Bewertung auswählt und
in eine Word-Vorlage einfügt. Bedienung über eine Streamlit-Weboberfläche.

> **Harte Anforderungen (nicht verhandelbar):** keine Cloud, keine externe API,
> keine externe KI, keine Datenübertragung nach aussen. Alles bleibt auf dem
> Rechner. Es werden **keine** Sätze hartcodiert – sämtliche Texte stammen aus
> der Excel-Satzdatenbank.

## Schnellstart (macOS)

1. `start.command` doppelklicken. Beim ersten Mal wird automatisch eine
   virtuelle Umgebung angelegt und die Abhängigkeiten installiert (ein bis zwei
   Minuten).
2. Der Browser öffnet sich auf <http://localhost:8501>. Falls nicht: manuell
   diese Adresse aufrufen, solange das Terminal-Fenster offen ist.

## Start (manuell, alle Plattformen)

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python generate_assets.py        # erzeugt Demo-Daten, falls keine echten vorhanden
streamlit run app/main.py
```

## Echte Daten einsetzen

Die App ist sofort mit **Demo-Daten** lauffähig. Für den Echtbetrieb:

- eigene Satzdatenbank als `data/satzdatenbank.xlsx` ablegen,
- echte WKVZ-Vorlage als `templates/arbeitszeugnis_lehrperson.docx` ablegen.

`generate_assets.py` **überschreibt vorhandene Dateien nie** – echte Daten sind
also sicher. Die echte WKVZ-Vorlage wird eingebettet, indem im Word-XML die
`[Platzhalter]` durch `{{ jinja }}`-Variablen ersetzt werden (Formatierung
bleibt erhalten). Die 20 Vorlagen-Variablen stehen in
`app/word_generator.py` (`TEMPLATE_VARS`).

### Excel-Format

Drei Tabellenblätter (Führungskräfte · Mitarbeitende · Lehrpersonen). Pro Blatt:

| Kompetenzbereich | Beobachtungsmerkmal | 100 | 200 | 300 | 400 |
|---|---|---|---|---|---|

- **100/200/300/400** sind die Gradcodes (100 = bestes). Die UI zeigt 4/3/2/1
  (4 = bestes) und mappt intern: 4→100, 3→200, 2→300, 1→400.
- Die Grad-Spalten werden über die **Codes** erkannt, nicht über den Namen.
- Zusammengeführte (leere) Kompetenzbereich-Zellen werden beim Einlesen per
  **forward-fill** aufgefüllt.
- Erkennung von Blättern/Spalten ist umlaut- und gross/klein-unabhängig.

## Wichtige Entscheidungen

- **4 → 2 Gruppierung (Annahme, anpassbar in `app/config.py`):** die Satztabelle
  hat 4 Lehrperson-Kompetenzbereiche, die Vorlage nur 2 Absätze.
  - Absatz 1 (Unterrichtsqualität) = Unterrichtsqualität + Schülerorientierung
  - Absatz 2 (Sozialverhalten) = Zusammenarbeit/Engagement + Organisation/Professionalität
- **Geschlecht/Name** werden automatisch aufgelöst (`app/gender.py`): aus der
  Anrede entstehen `Frau/Herr <Nachname>`, `sie/er`, `ihre/seine` … Es wird eine
  **explizite Token-Map** genutzt (kein simples `split("/")`), weil die
  Satztabelle die Reihenfolge weiblich/männlich nutzt und unbekannte
  Schrägstriche (`und/oder`, `50/50`, `2024/2025`) unangetastet bleiben müssen.
  Bei „Divers / keine Angabe" bleiben die zweigeschlechtlichen Formen erhalten.
- **Punktuationssichere Verbindung** (`sentence_engine.verbinde_saetze`):
  verhindert Run-ons, wenn Quellsätze keinen Schlusspunkt haben – **ohne die
  Quelldaten zu verändern.**
- **Schlusssätze** (Standard / Mit Bedauern / Auf eigenen Wunsch / Befristet)
  zur Auswahl, frei überschreibbar. Optionaler Sonderabsatz für befristete
  Verhältnisse und ein freier Zusatzabsatz.

## Tests

```bash
pip install pytest
pytest
```

Abgedeckt: Geschlechts-/Namensauflösung, Excel-Normalisierung (forward-fill,
Gradcode-Erkennung), Auswahl-/Gruppierungs-/Verbindungslogik, Word-Render
(Frau & Herr) sowie ein Streamlit-AppTest-Durchlauf (Formular → Export).

## Projektstruktur

```
arbeitszeugnis-generator/
├── app/
│   ├── main.py            # Streamlit-Frontend (Formular, Vorschau, Export)
│   ├── excel_reader.py    # Excel laden + Normalisierung (forward-fill, long format)
│   ├── sentence_engine.py # Auswahl & Zusammensetzung der Textbausteine
│   ├── word_generator.py  # Befüllen der Word-Vorlagen (docxtpl)
│   ├── gender.py          # Geschlecht/Name-Auflösung (Token-Map)
│   ├── validation.py      # Benutzerfreundliche Prüfungen
│   └── config.py          # Pfade, Mappings, Konstanten
├── data/                  # satzdatenbank.xlsx (echt oder Demo)
├── templates/             # Word-Vorlagen (echt oder Demo)
├── output/                # erzeugte Zeugnisse (.docx)
├── tests/                 # pytest (Unit + AppTest-e2e)
├── generate_assets.py     # erzeugt Demo-Assets (überschreibt echte Dateien nie)
├── start.command          # Doppelklick-Starter für macOS
└── requirements.txt
```

## Offene nächste Schritte

1. **FK/MA-Vorlagen:** echte WKVZ-Vorlagen für Führungskräfte & Mitarbeitende
   einbetten (gleicher Ansatz wie Lehrperson). Aktuell nur Demo-Vorlagen.
2. **4→2-Gruppierung bestätigen:** ist die Zuordnung der Kompetenzbereiche zu
   den 2 Absätzen korrekt? (begründete, anpassbare Annahme in `config.py`).
3. **Quell-Excel-Tippfehler** in der echten Datei korrigieren (z. B.
   `adressantengerechte` → `adressatengerechte`, `Sorgfältig` → `sorgfältig`).
4. **Stil:** wenn benachbarte Merkmale beide mit dem Namen beginnen, die zweite
   Nennung optional zum Pronomen machen.
