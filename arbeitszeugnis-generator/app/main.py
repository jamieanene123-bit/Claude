"""Streamlit-Frontend: Formular, Vorschau, Export.

Komplett lokal – keine Cloud, keine externe API. Start:

    streamlit run app/main.py
"""

from __future__ import annotations

import os
import sys

# Pfad-Bootstrap, damit `from app import ...` sowohl bei `streamlit run app/main.py`
# als auch im AppTest funktioniert (app/main.py läuft als Top-Level-Skript).
_HERE = os.path.dirname(os.path.abspath(__file__))
_BASE = os.path.dirname(_HERE)
if _BASE not in sys.path:
    sys.path.insert(0, _BASE)

import streamlit as st  # noqa: E402

from app import (  # noqa: E402
    config,
    excel_reader,
    sentence_engine,
    validation,
    word_generator,
)
import generate_assets  # noqa: E402


st.set_page_config(page_title="Arbeitszeugnisgenerator", page_icon="📝", layout="centered")


# ---------------------------------------------------------------------------
# Daten laden (gecacht über Pfad + Änderungszeit)
# ---------------------------------------------------------------------------
def lade_db():
    pfad = config.SATZDATENBANK
    return excel_reader.lade_cached(pfad, os.path.getmtime(pfad))


def _format_note(n: int) -> str:
    return config.BEWERTUNG_LABELS.get(n, str(n))


# ---------------------------------------------------------------------------
# UI
# ---------------------------------------------------------------------------
st.title("📝 Arbeitszeugnisgenerator")
st.caption("Lokales MVP · Schweiz · alle Texte stammen aus der Excel-Satzdatenbank")

datei_pruefung = validation.pruefe_dateien()
if not datei_pruefung.ok:
    for f in datei_pruefung.fehler:
        st.error(f)
    if st.button("Demo-Daten erzeugen (überschreibt keine echten Dateien)"):
        generate_assets.main()
        st.rerun()
    st.stop()

df = lade_db()

# Aktuell ist nur die Lehrperson-Variante fertig ausgebaut (bewusst).
ZIELGRUPPE = "lehrperson"
st.info(
    "Fertig ausgebaut ist aktuell die **Lehrperson**-Variante. "
    "Vorlagen für Führungskräfte/Mitarbeitende sind als Demo hinterlegt."
)

# --- Personalien -----------------------------------------------------------
st.header("1 · Personalien")
c1, c2 = st.columns(2)
with c1:
    anrede = st.selectbox("Anrede", list(config.ANREDE_OPTIONEN.keys()), key="anrede")
    voller_name = st.text_input("Voller Name", key="voller_name", placeholder="Vorname Nachname")
    geburtsdatum = st.text_input("Geburtsdatum", key="geburtsdatum", placeholder="TT.MM.JJJJ")
    heimatort = st.text_input("Heimatort", key="heimatort", placeholder="z. B. Bern BE")
    funktion = st.text_input("Funktion", key="funktion", placeholder="z. B. Klassenlehrperson")
with c2:
    eintrittsdatum = st.text_input("Eintrittsdatum", key="eintrittsdatum", placeholder="TT.MM.JJJJ")
    austrittsdatum = st.text_input("Austrittsdatum", key="austrittsdatum", placeholder="TT.MM.JJJJ")
    pensum = st.text_input("Pensum", key="pensum", placeholder="z. B. 80 %")
    fachbereiche = st.text_input("Fachbereiche", key="fachbereiche", placeholder="z. B. Deutsch, Mathematik")
    klassen = st.text_input("Klassen", key="klassen", placeholder="z. B. 5a, 6b")

with st.expander("Adresse & Ausstellung (optional)"):
    strasse_hausnummer = st.text_input("Strasse / Hausnummer", key="strasse_hausnummer")
    plz_ort = st.text_input("PLZ / Ort", key="plz_ort")
    ausstellungsdatum = st.text_input("Ausstellungsdatum", key="ausstellungsdatum", placeholder="TT.MM.JJJJ")

geschlecht = config.ANREDE_OPTIONEN.get(anrede, "d")

# --- Bewertungen -----------------------------------------------------------
st.header("2 · Bewertung der Kompetenzbereiche")
st.caption("4 = sehr gut · 3 = gut · 2 = genügend · 1 = ungenügend")

bewertungen: dict = {}
for bereich in excel_reader.kompetenzbereiche(df, ZIELGRUPPE):
    with st.expander(bereich or "(ohne Kompetenzbereich)", expanded=True):
        for merkmal in excel_reader.merkmale(df, ZIELGRUPPE, bereich):
            # Schlüssel = (Kompetenzbereich, Merkmal): gleiches Merkmal-Label
            # kann in mehreren Bereichen vorkommen und darf sich nicht überschreiben.
            bewertungen[(bereich, merkmal)] = st.selectbox(
                merkmal,
                config.UI_BEWERTUNGEN,
                index=0,  # Default: 4 (bestes)
                format_func=_format_note,
                key=f"bew::{bereich}::{merkmal}",
            )

# --- Schlusssatz & Sonderabsätze ------------------------------------------
st.header("3 · Schlusssatz & Sonderabsätze")
schluss_key = st.selectbox("Schlusssatz-Vorlage", list(config.SCHLUSSSAETZE.keys()), key="schluss_key")
schluss_vorschau = sentence_engine.schlusssatz(geschlecht, voller_name or "[Name]", schluss_key)
schluss_eigen = st.text_area(
    "Schlusssatz (frei überschreibbar)",
    value=schluss_vorschau,
    key="schluss_eigen",
    height=120,
)

befristet = st.checkbox("Befristetes Arbeitsverhältnis (Sonderabsatz einfügen)", key="befristet")
zusatz_eigen = st.text_area("Zusätzlicher Absatz (optional, z. B. Zusatzfunktion)", key="zusatz_eigen", height=80)

# --- Generierung -----------------------------------------------------------
st.header("4 · Vorschau & Export")

if st.button("Zeugnis erzeugen", type="primary", key="generieren"):
    eingabe_pruefung = validation.pruefe_eingaben(
        {"voller_name": voller_name, "anrede": anrede, "funktion": funktion}
    )
    for h in eingabe_pruefung.hinweise:
        st.info(h)

    if not eingabe_pruefung.ok:
        for f in eingabe_pruefung.fehler:
            st.error(f)
    else:
        absaetze = sentence_engine.baue_absaetze_lehrperson(
            df, bewertungen, geschlecht, voller_name
        )
        absatz_pruefung = validation.pruefe_absaetze(absaetze)
        for h in absatz_pruefung.hinweise:
            st.warning(h)
        # Bewertete Merkmale ohne Absatz-Zuordnung sichtbar machen (nicht still verlieren).
        for bereich_, merkmal_ in sentence_engine.unzugeordnete_merkmale(df, bewertungen):
            st.warning(
                f"Bewertung für '{merkmal_}' (Bereich '{bereich_ or '–'}') konnte keinem "
                "Absatz zugeordnet werden und erscheint nicht im Zeugnis."
            )

        schlusssatz = sentence_engine.schlusssatz(
            geschlecht, voller_name, schluss_key, schluss_eigen
        )
        vertrag_absatz = (
            sentence_engine.gender.aufloesen(
                config.VERTRAG_ABSATZ_VORLAGE.replace("[Austrittsdatum]", austrittsdatum or ""),
                geschlecht,
                voller_name,
            )
            if befristet
            else ""
        )
        zusatz_absatz = sentence_engine.gender.aufloesen(zusatz_eigen, geschlecht, voller_name)

        pron = sentence_engine.gender.pronomen(geschlecht)
        context = {
            "anrede": anrede,
            "voller_name": voller_name,
            "geburtsdatum": geburtsdatum,
            "eintrittsdatum": eintrittsdatum,
            "austrittsdatum": austrittsdatum,
            "funktion": funktion,
            "fachbereiche": fachbereiche,
            "klassen": klassen,
            "pensum": pensum,
            "pron_er_sie": pron["pron_er_sie"],
            "poss_sein_ihr": pron["poss_sein_ihr"],
            "absatz_unterrichtsqualitaet": absaetze["absatz_unterrichtsqualitaet"],
            "absatz_sozialverhalten": absaetze["absatz_sozialverhalten"],
            "schlusssatz": schlusssatz,
            "vertrag_absatz": vertrag_absatz,
            "zusatz_absatz": zusatz_absatz,
            "strasse_hausnummer": strasse_hausnummer,
            "plz_ort": plz_ort,
            "ausstellungsdatum": ausstellungsdatum,
            "heimatort": heimatort,
        }

        try:
            docx_bytes = word_generator.rendere(context)
        except Exception as exc:  # benutzerfreundlich statt Traceback
            st.error(f"Word-Vorlage konnte nicht gefüllt werden: {exc}")
            docx_bytes = None

        st.session_state["letzter_context"] = context
        st.session_state["letzte_docx"] = docx_bytes

        st.subheader("Unterrichtsqualität")
        st.write(absaetze["absatz_unterrichtsqualitaet"] or "_(leer)_")
        st.subheader("Sozialverhalten und Zusammenarbeit")
        st.write(absaetze["absatz_sozialverhalten"] or "_(leer)_")
        if vertrag_absatz:
            st.subheader("Vertrag")
            st.write(vertrag_absatz)
        if zusatz_absatz:
            st.subheader("Zusatz")
            st.write(zusatz_absatz)
        st.subheader("Schlusssatz")
        st.write(schlusssatz)

        if docx_bytes:
            safe_name = (voller_name or "zeugnis").strip().replace(" ", "_")
            st.download_button(
                "📄 Word-Dokument herunterladen",
                data=docx_bytes,
                file_name=f"Arbeitszeugnis_{safe_name}.docx",
                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                key="download",
            )
            st.success("Zeugnis erzeugt. Alles lokal – nichts verlässt diesen Rechner.")
