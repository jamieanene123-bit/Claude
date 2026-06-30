"""End-to-End-Tests.

  * Word-Render (Quick-Look) für Frau & Herr.
  * Streamlit AppTest: Formular ausfüllen, Zeugnis erzeugen, Ergebnis prüfen.
"""

import os

from app import config, excel_reader, sentence_engine, word_generator


def _kontext(geschlecht, voller_name):
    df = excel_reader.lade_satzdatenbank()
    lp = df[df["zielgruppe"] == "lehrperson"]
    bew = {(r.kompetenzbereich, r.beobachtungsmerkmal): 4 for r in lp.itertuples()}
    absaetze = sentence_engine.baue_absaetze_lehrperson(df, bew, geschlecht, voller_name)
    return {
        "anrede": "Frau" if geschlecht == "w" else "Herr",
        "voller_name": voller_name,
        "funktion": "Klassenlehrperson",
        "schlusssatz": sentence_engine.schlusssatz(geschlecht, voller_name, "Standard"),
        **absaetze,
    }


def test_render_frau_und_herr():
    for g, name in (("w", "Maria Beispiel"), ("m", "Thomas Beispiel")):
        daten = word_generator.rendere(_kontext(g, name))
        assert daten[:2] == b"PK"  # gültiges .docx (ZIP)
        assert len(daten) > 5000


def test_xml_sonderzeichen_bleiben_erhalten():
    # Nutzereingaben mit &, <, > dürfen das Word-XML nicht zerstören/abschneiden.
    import io

    from docx import Document

    name = 'Anna Müller & <Co> "AG"'
    ctx = _kontext("w", name)
    ctx["funktion"] = "R&D <Lead>"
    daten = word_generator.rendere(ctx)
    assert daten[:2] == b"PK"
    txt = "\n".join(p.text for p in Document(io.BytesIO(daten)).paragraphs)
    assert name in txt
    assert "R&D <Lead>" in txt


def test_speichern_in_output():
    pfad = word_generator.speichere(_kontext("w", "Maria Beispiel"), "test_quicklook.docx")
    assert os.path.exists(pfad)
    assert os.path.getsize(pfad) > 5000


def test_apptest_e2e():
    from streamlit.testing.v1 import AppTest

    script = os.path.join(config.BASE_DIR, "app", "main.py")
    at = AppTest.from_file(script, default_timeout=90).run()
    assert not at.exception

    at.selectbox(key="anrede").set_value("Frau")
    at.text_input(key="voller_name").set_value("Maria Beispiel")
    at.text_input(key="funktion").set_value("Klassenlehrperson")
    at.run()

    at.button(key="generieren").click().run()
    assert not at.exception

    # Generiertes Dokument liegt im Session-State und ist ein gültiges .docx.
    docx = at.session_state["letzte_docx"]
    assert docx is not None and docx[:2] == b"PK"

    ctx = at.session_state["letzter_context"]
    assert ctx["voller_name"] == "Maria Beispiel"
    assert "Frau Beispiel" in ctx["absatz_unterrichtsqualitaet"]
    assert "sie/er" not in ctx["absatz_unterrichtsqualitaet"]  # geschlechtsaufgelöst


def test_apptest_herr_pronomen():
    from streamlit.testing.v1 import AppTest

    script = os.path.join(config.BASE_DIR, "app", "main.py")
    at = AppTest.from_file(script, default_timeout=90).run()
    at.selectbox(key="anrede").set_value("Herr")
    at.text_input(key="voller_name").set_value("Thomas Beispiel")
    at.run()
    at.button(key="generieren").click().run()
    assert not at.exception
    ctx = at.session_state["letzter_context"]
    assert "Herr Beispiel" in ctx["absatz_unterrichtsqualitaet"]
    assert ctx["pron_er_sie"] == "er"
