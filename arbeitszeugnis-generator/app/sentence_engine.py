"""Auswahl und Zusammensetzung der Textbausteine.

Kernaufgaben:
  * Pro Beobachtungsmerkmal den passenden Satzbaustein zur gewählten Note holen
    (UI-Note 4/3/2/1 -> Gradcode 100/200/300/400).
  * Die 4 Lehrperson-Kompetenzbereiche zu den 2 Vorlagen-Absätzen gruppieren
    (config.LEHRPERSON_ABSATZ_GRUPPEN, anpassbar).
  * Sätze punktuationssicher verbinden (keine Run-ons), ohne die Quelldaten zu
    verändern.
  * Geschlecht/Name auflösen (gender.py).

Es werden keine Sätze erfunden – fehlt zu einer Auswahl ein Baustein, wird die
Auswahl schlicht ausgelassen (und in der UI über validation.py gemeldet).
"""

from __future__ import annotations

import pandas as pd

from . import config, excel_reader, gender


# ---------------------------------------------------------------------------
# Punktuationssichere Verbindung
# ---------------------------------------------------------------------------
_SATZ_ENDE = (".", "!", "?", "…")
# Schluss-Markierungen, die NACH einem Satzzeichen stehen können (Anführungs-
# und Klammerzeichen). Werden vor der Endeprüfung abgestreift, damit z. B.
# 'Er sagte "ja."' als abgeschlossen erkannt wird (kein doppelter Punkt).
_SCHLUSS_MARKEN = '"“”»’\')]'


def _ist_beendet(text: str) -> bool:
    return text.rstrip().rstrip(_SCHLUSS_MARKEN).endswith(_SATZ_ENDE)


def verbinde_saetze(saetze) -> str:
    """Verbindet mehrere Sätze zu einem Absatz.

    Fügt zwischen zwei Sätzen einen Punkt ein, wenn der vordere keinen
    Schlusspunkt hat – verhindert Run-ons, ohne die Quelldaten zu verändern.
    Der zusammengesetzte Absatz endet ebenfalls sauber mit Satzzeichen.
    """
    teile = [str(s).strip() for s in saetze if s is not None and str(s).strip() != ""]
    if not teile:
        return ""

    ergebnis = ""
    for i, teil in enumerate(teile):
        if i == 0:
            ergebnis = teil
            continue
        if not _ist_beendet(ergebnis):
            ergebnis += "."
        ergebnis += " " + teil

    if not _ist_beendet(ergebnis):
        ergebnis += "."
    return ergebnis


# ---------------------------------------------------------------------------
# Auswahl der Bausteine
# ---------------------------------------------------------------------------
def _gruppe_fuer_bereich(bereich: str) -> "str | None":
    """Findet den Absatz-Key, zu dem ein Kompetenzbereich gehört (tolerant)."""
    norm = excel_reader._normalisiere(bereich)
    for gruppe in config.LEHRPERSON_ABSATZ_GRUPPEN:
        for stichworte in gruppe["bereiche_stichworte"]:
            if any(s in norm for s in stichworte):
                return gruppe["key"]
    return None


def baue_absaetze_lehrperson(
    df: pd.DataFrame,
    bewertungen: dict,
    geschlecht: str,
    voller_name: str,
) -> dict:
    """Erzeugt die 2 Lehrperson-Absätze aus den Merkmal-Bewertungen.

    ``bewertungen``: {(kompetenzbereich, beobachtungsmerkmal): ui_note(1..4)}.
    Der Kompetenzbereich gehört zum Schlüssel, weil dasselbe Merkmal-Label in
    mehreren Bereichen vorkommen kann.
    Rückgabe: {absatz_key: text} für jeden in config definierten Absatz
    (auch leere, damit die Vorlagen-Variablen immer existieren).
    """
    zielgruppe = "lehrperson"

    # Sätze je Absatz sammeln; Reihenfolge aus der Datenbank beibehalten.
    gruppen_saetze = {g["key"]: [] for g in config.LEHRPERSON_ABSATZ_GRUPPEN}
    for bereich in excel_reader.kompetenzbereiche(df, zielgruppe):
        gruppe_key = _gruppe_fuer_bereich(bereich)
        if gruppe_key is None:
            # Nicht zuordenbarer Bereich -> wird über pruefe_zuordnung gemeldet.
            continue
        for merkmal in excel_reader.merkmale(df, zielgruppe, bereich):
            ui_note = bewertungen.get((bereich, merkmal))
            if ui_note is None:
                continue
            grad = config.UI_TO_GRADE.get(int(ui_note))
            if grad is None:
                continue
            baustein = excel_reader.satz(df, zielgruppe, bereich, merkmal, grad)
            if baustein:
                gruppen_saetze[gruppe_key].append(baustein)

    absaetze = {}
    for key, roh_saetze in gruppen_saetze.items():
        verbunden = verbinde_saetze(roh_saetze)
        absaetze[key] = gender.aufloesen(verbunden, geschlecht, voller_name)

    return absaetze


def unzugeordnete_merkmale(df: pd.DataFrame, bewertungen: dict) -> list:
    """Liefert bewertete (kompetenzbereich, merkmal)-Paare, die keinem Absatz
    zugeordnet werden konnten (z. B. leerer/unbekannter Kompetenzbereich).

    Damit lässt sich verhindern, dass eine vergebene Bewertung still verloren
    geht – die UI kann darauf hinweisen.
    """
    zielgruppe = "lehrperson"
    fehlend = []
    for bereich in excel_reader.kompetenzbereiche(df, zielgruppe):
        zuordenbar = _gruppe_fuer_bereich(bereich) is not None
        for merkmal in excel_reader.merkmale(df, zielgruppe, bereich):
            if bewertungen.get((bereich, merkmal)) is None:
                continue
            if not zuordenbar:
                fehlend.append((bereich, merkmal))
    return fehlend


def schlusssatz(name_geschlecht: str, voller_name: str, vorlage_key: str, eigener_text: str = "") -> str:
    """Liefert den (ggf. überschriebenen) Schlusssatz, geschlechtsaufgelöst."""
    roh = eigener_text.strip() if eigener_text and eigener_text.strip() else config.SCHLUSSSAETZE.get(
        vorlage_key, ""
    )
    return gender.aufloesen(roh, name_geschlecht, voller_name)
