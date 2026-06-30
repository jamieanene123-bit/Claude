"""Tests des Excel-Einlesens und der Normalisierung."""

from app import config, excel_reader


def test_drei_zielgruppen_erkannt(df):
    assert set(df["zielgruppe"].unique()) == {"lehrperson", "mitarbeitende", "fuehrungskraft"}


def test_long_format_spalten(df):
    assert list(df.columns) == [
        "zielgruppe",
        "kompetenzbereich",
        "beobachtungsmerkmal",
        "grad",
        "satz",
    ]


def test_alle_gradcodes_vorhanden(df):
    lp = df[df["zielgruppe"] == "lehrperson"]
    assert set(lp["grad"].unique()) == set(config.GRADE_CODES)


def test_ffill_keine_leeren_bereiche(df):
    # Zusammengeführte Kompetenzbereich-Zellen wurden per forward-fill aufgefüllt.
    lp = df[df["zielgruppe"] == "lehrperson"]
    assert (lp["kompetenzbereich"].str.strip() == "").sum() == 0


def test_vier_lehrperson_bereiche(df):
    bereiche = excel_reader.kompetenzbereiche(df, "lehrperson")
    assert len(bereiche) == 4
    assert "Unterrichtsqualität" in bereiche
    assert "Schülerorientierung" in bereiche


def test_satz_lookup(df):
    s = excel_reader.satz(df, "lehrperson", "Unterrichtsqualität", "Fachkompetenz", 100)
    assert s and "Fachwissen" in s
    # Note 400 ist ein anderer (schwächerer) Baustein.
    assert excel_reader.satz(df, "lehrperson", "Unterrichtsqualität", "Fachkompetenz", 400) != s


def test_grad_spalten_ueber_codes():
    # Erkennung erfolgt über die Codes, nicht über Spaltennamen.
    treffer = excel_reader._grad_spalten(["Kompetenzbereich", "Merkmal", 100, 200, 300, 400])
    assert set(treffer.keys()) == {100, 200, 300, 400}
