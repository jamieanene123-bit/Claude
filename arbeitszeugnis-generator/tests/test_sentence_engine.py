"""Tests der Auswahl-, Gruppierungs- und Verbindungslogik."""

import pandas as pd

from app import config, sentence_engine


def _alle_bewertungen(df, note=4):
    """{(kompetenzbereich, beobachtungsmerkmal): note} für alle Lehrperson-Merkmale."""
    lp = df[df["zielgruppe"] == "lehrperson"]
    return {(r.kompetenzbereich, r.beobachtungsmerkmal): note for r in lp.itertuples()}


def _lp_df(rows):
    """Synthetisches long-format DataFrame für gezielte Szenarien."""
    return pd.DataFrame(
        [
            {
                "zielgruppe": "lehrperson",
                "kompetenzbereich": kb,
                "beobachtungsmerkmal": bm,
                "grad": grad,
                "satz": satz,
            }
            for kb, bm, grad, satz in rows
        ]
    )


# --- verbinde_saetze -------------------------------------------------------
def test_verbinde_fuegt_punkt_ein():
    out = sentence_engine.verbinde_saetze(["Satz eins ohne Punkt", "Satz zwei."])
    assert out == "Satz eins ohne Punkt. Satz zwei."


def test_verbinde_keine_doppelpunkte():
    out = sentence_engine.verbinde_saetze(["Eins.", "Zwei."])
    assert out == "Eins. Zwei."
    assert ".." not in out


def test_verbinde_schlusszeichen_hinter_anfuehrung():
    # Schlusspunkt hinter schliessendem Anführungszeichen -> kein doppelter Punkt.
    out = sentence_engine.verbinde_saetze(['Er sagte "ja."', "Weiter."])
    assert out == 'Er sagte "ja." Weiter.'
    assert '."."' not in out


def test_verbinde_leere_eingaben():
    assert sentence_engine.verbinde_saetze([]) == ""
    assert sentence_engine.verbinde_saetze(["", None, "  "]) == ""


def test_verbinde_endet_mit_satzzeichen():
    assert sentence_engine.verbinde_saetze(["Ohne Punkt"]) == "Ohne Punkt."
    assert sentence_engine.verbinde_saetze(["Mit Frage?"]) == "Mit Frage?"


# --- Auswahl & Gruppierung -------------------------------------------------
def test_zwei_absaetze_erzeugt(df):
    absaetze = sentence_engine.baue_absaetze_lehrperson(
        df, _alle_bewertungen(df), "w", "Maria Beispiel"
    )
    keys = {g["key"] for g in config.LEHRPERSON_ABSATZ_GRUPPEN}
    assert set(absaetze.keys()) == keys
    for v in absaetze.values():
        assert v.strip() != ""


def test_gruppierung_4_zu_2(df):
    absaetze = sentence_engine.baue_absaetze_lehrperson(
        df, _alle_bewertungen(df), "w", "Maria Beispiel"
    )
    a1 = absaetze["absatz_unterrichtsqualitaet"]
    a2 = absaetze["absatz_sozialverhalten"]
    assert "Fachwissen" in a1
    assert "Lernenden" in a1
    assert "Kollegium" in a2


def test_run_on_vermieden(df):
    a1 = sentence_engine.baue_absaetze_lehrperson(
        df, _alle_bewertungen(df), "w", "Maria Beispiel"
    )["absatz_unterrichtsqualitaet"]
    assert "adressatengerecht Frau" not in a1
    assert "adressatengerecht. " in a1


def test_fehlende_bewertung_wird_ausgelassen(df):
    bew = {("Unterrichtsqualität", "Fachkompetenz"): 4}
    a1 = sentence_engine.baue_absaetze_lehrperson(df, bew, "m", "Thomas Beispiel")[
        "absatz_unterrichtsqualitaet"
    ]
    assert a1.startswith("Herr Beispiel verfügt über ein ausgezeichnetes")
    assert a1.count("Herr Beispiel") == 1


def test_gleiches_merkmal_in_zwei_bereichen(df):
    # Regression: dasselbe Merkmal-Label in zwei Bereichen darf sich weder
    # überschreiben noch denselben Baustein liefern.
    synth = _lp_df(
        [
            ("Unterrichtsqualität", "Fachkompetenz", 100, "UQ-Baustein."),
            ("Organisation und Professionalität", "Fachkompetenz", 100, "ORG-Baustein."),
        ]
    )
    bew = {
        ("Unterrichtsqualität", "Fachkompetenz"): 4,
        ("Organisation und Professionalität", "Fachkompetenz"): 4,
    }
    absaetze = sentence_engine.baue_absaetze_lehrperson(synth, bew, "w", "Maria Beispiel")
    assert absaetze["absatz_unterrichtsqualitaet"] == "UQ-Baustein."
    assert absaetze["absatz_sozialverhalten"] == "ORG-Baustein."


def test_unzugeordnetes_merkmal_gemeldet_nicht_still_verloren():
    # Leerer/unbekannter Kompetenzbereich -> Merkmal wird gemeldet statt still verworfen.
    synth = _lp_df([("", "Komisches Merkmal", 100, "Verwaister Satz.")])
    bew = {("", "Komisches Merkmal"): 4}
    assert sentence_engine.unzugeordnete_merkmale(synth, bew) == [("", "Komisches Merkmal")]
    absaetze = sentence_engine.baue_absaetze_lehrperson(synth, bew, "w", "X")
    zusammen = absaetze["absatz_unterrichtsqualitaet"] + absaetze["absatz_sozialverhalten"]
    assert "Verwaister Satz." not in zusammen


# --- Schlusssatz -----------------------------------------------------------
def test_schlusssatz_aufgeloest():
    s = sentence_engine.schlusssatz("m", "Thomas Beispiel", "Standard")
    assert "Herr Beispiel" in s
    assert "ihr/ihm" not in s  # geschlechtsaufgelöst


def test_schlusssatz_eigener_text_ueberschreibt():
    s = sentence_engine.schlusssatz("w", "Maria Beispiel", "Standard", "Eigener Text für [Name].")
    assert s == "Eigener Text für Frau Beispiel."
