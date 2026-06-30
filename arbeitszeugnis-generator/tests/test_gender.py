"""Tests der Geschlechts-/Namensauflösung (explizite Token-Map)."""

from app import gender


def test_name_anrede():
    assert gender.anrede_name("w", "Maria Beispiel") == "Frau Beispiel"
    assert gender.anrede_name("m", "Thomas Beispiel") == "Herr Beispiel"
    # divers: voller Name ohne geschlechtliche Anrede
    assert gender.anrede_name("d", "Alex Beispiel") == "Alex Beispiel"


def test_token_weiblich():
    t = "[Name] bringt sie/er ihren/seinen Unterricht ein."
    out = gender.aufloesen(t, "w", "Maria Beispiel")
    assert out == "Frau Beispiel bringt sie ihren Unterricht ein."


def test_token_maennlich():
    t = "[Name] bringt sie/er ihren/seinen Unterricht ein."
    out = gender.aufloesen(t, "m", "Thomas Beispiel")
    assert out == "Herr Beispiel bringt er seinen Unterricht ein."


def test_divers_behaelt_beide_formen():
    t = "[Name] bringt sie/er ihren/seinen Unterricht ein."
    out = gender.aufloesen(t, "d", "Alex Beispiel")
    assert out == "Alex Beispiel bringt sie/er ihren/seinen Unterricht ein."


def test_satzanfang_grossschreibung():
    t = "Ihren/Seinen Unterricht gestaltet sie/er gut."
    assert gender.aufloesen(t, "w", "X") == "Ihren Unterricht gestaltet sie gut."
    assert gender.aufloesen(t, "m", "X") == "Seinen Unterricht gestaltet er gut."


def test_unbekannte_schraegstriche_unangetastet():
    # KEIN simples split('/'): fachfremde Slashes bleiben erhalten.
    for g in ("w", "m", "d"):
        assert gender.aufloesen("Pensum 50/50 und/oder Vertretung 2024/2025.", g, "X") == (
            "Pensum 50/50 und/oder Vertretung 2024/2025."
        )


def test_laengste_token_zuerst():
    # 'ihren/seinen' darf nicht als 'ihr/sein' + 'en/en' zerfallen.
    assert gender.aufloesen("für ihren/seinen Einsatz", "m", "X") == "für seinen Einsatz"


def test_keine_unaufgeloesten_token_in_quelldaten():
    """Jeder Geschlechts-Token in DB + Schlusssätzen muss in der Map abgedeckt sein.

    Nach der Auflösung für 'w' und 'm' darf kein bekannter weiblich/männlich-Token
    mehr im Text stehen (sonst landet z. B. 'sie/er' im fertigen Zeugnis).
    """
    from app import config, excel_reader

    df = excel_reader.lade_satzdatenbank()
    texte = list(df["satz"]) + list(config.SCHLUSSSAETZE.values()) + [config.VERTRAG_ABSATZ_VORLAGE]
    for g in ("w", "m"):
        for t in texte:
            out = gender.aufloesen(t, g, "Test Person")
            for token in config.GENDER_TOKENS:
                assert token not in out, f"Token {token!r} blieb unaufgelöst in: {out!r}"


def test_grad_code_keine_falschtreffer():
    from app import excel_reader

    # "1000" darf nicht als 100 erkannt werden; "Note 100" schon.
    treffer = excel_reader._grad_spalten(["Bereich", "Note 100", "200", "x300x", "400 Punkte", "1000"])
    assert treffer.get(100) == "Note 100"
    assert treffer.get(200) == "200"
    assert 100 not in [k for k, v in treffer.items() if v == "1000"]


def test_pronomen_variablen():
    assert gender.pronomen("w") == {"pron_er_sie": "sie", "poss_sein_ihr": "ihre"}
    assert gender.pronomen("m") == {"pron_er_sie": "er", "poss_sein_ihr": "seine"}
    assert gender.pronomen("d")["pron_er_sie"] == "sie/er"
