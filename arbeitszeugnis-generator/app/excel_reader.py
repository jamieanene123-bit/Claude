"""Excel-Satzdatenbank laden und normalisieren.

Ergebnis ist ein "long format" DataFrame: ein Datensatz je
(Zielgruppe, Kompetenzbereich, Beobachtungsmerkmal, Grad) mit dem zugehörigen
Satzbaustein.

Toleranzen:
  * Tabellenblätter werden umlaut-/gross-klein-unabhängig erkannt
    (``config.SHEET_HINTS``).
  * Die Spalten "Kompetenzbereich" / "Beobachtungsmerkmal" werden über
    Stichwörter erkannt; die Grad-Spalten über die Codes 100/200/300/400.
  * Zusammengeführte (leere) Kompetenzbereich-Zellen werden per forward-fill
    aufgefüllt.

Es werden KEINE Quelldaten verändert oder Sätze erfunden – nur eingelesen und
in eine gut verarbeitbare Form gebracht.
"""

from __future__ import annotations

import functools
import re

import pandas as pd

from . import config


# ---------------------------------------------------------------------------
# Hilfen für tolerante Erkennung
# ---------------------------------------------------------------------------
def _normalisiere(text) -> str:
    """lower + Umlaute auflösen + Whitespace trimmen (für Vergleiche)."""
    if text is None:
        return ""
    s = str(text).strip().lower()
    for a, b in (("ä", "ae"), ("ö", "oe"), ("ü", "ue"), ("ß", "ss")):
        s = s.replace(a, b)
    return s


def _finde_blatt(blattnamen, stichworte) -> "str | None":
    for name in blattnamen:
        norm = _normalisiere(name)
        if any(s in norm for s in stichworte):
            return name
    return None


def _finde_spalte(spalten, stichworte) -> "str | None":
    for col in spalten:
        norm = _normalisiere(col)
        if any(s in norm for s in stichworte):
            return col
    return None


def _grad_spalten(spalten) -> dict:
    """Mappt Gradcode (100/200/300/400) -> tatsächlicher Spaltenname.

    Erkennung über die Codes selbst, nicht über den Spaltennamen. Ein Header
    "100", "100.0", "Note 100" o. ä. wird auf 100 gemappt.
    """
    treffer: dict[int, object] = {}
    for col in spalten:
        norm = _normalisiere(col)
        for code in config.GRADE_CODES:
            if code in treffer:
                continue
            # exakter Code, ".0"-Variante oder Code als eigenständige Zahl im
            # Header (z. B. "Note 100"). Ziffern-Grenze verhindert, dass "1000"
            # fälschlich als 100 erkannt wird.
            if (
                norm == str(code)
                or norm == f"{code}.0"
                or re.search(r"(?<!\d)" + str(code) + r"(?!\d)", norm) is not None
            ):
                treffer[code] = col
    return treffer


# ---------------------------------------------------------------------------
# Einlesen
# ---------------------------------------------------------------------------
def _blatt_zu_long(df: pd.DataFrame, zielgruppe: str) -> pd.DataFrame:
    """Ein rohes Blatt in long format überführen."""
    spalten = list(df.columns)
    kb_col = _finde_spalte(spalten, config.SPALTEN_HINTS["kompetenzbereich"])
    bm_col = _finde_spalte(spalten, config.SPALTEN_HINTS["beobachtungsmerkmal"])
    grad_map = _grad_spalten(spalten)

    if bm_col is None or not grad_map:
        # Blatt ohne erkennbare Struktur -> leer zurück (tolerant bleiben).
        return pd.DataFrame(
            columns=["zielgruppe", "kompetenzbereich", "beobachtungsmerkmal", "grad", "satz"]
        )

    work = df.copy()

    # Forward-fill der zusammengeführten Kompetenzbereich-Zellen.
    if kb_col is not None:
        work[kb_col] = work[kb_col].ffill()
    else:
        work["_kb_dummy"] = ""
        kb_col = "_kb_dummy"

    zeilen = []
    for _, row in work.iterrows():
        merkmal = row.get(bm_col)
        if merkmal is None or str(merkmal).strip() == "" or pd.isna(merkmal):
            # Zeile ohne Merkmal (z. B. Leer-/Trennzeile) überspringen.
            continue
        bereich = row.get(kb_col)
        bereich = "" if bereich is None or pd.isna(bereich) else str(bereich).strip()
        for code, col in grad_map.items():
            satz = row.get(col)
            if satz is None or pd.isna(satz) or str(satz).strip() == "":
                continue
            zeilen.append(
                {
                    "zielgruppe": zielgruppe,
                    "kompetenzbereich": bereich,
                    "beobachtungsmerkmal": str(merkmal).strip(),
                    "grad": int(code),
                    "satz": str(satz).strip(),
                }
            )

    return pd.DataFrame(
        zeilen,
        columns=["zielgruppe", "kompetenzbereich", "beobachtungsmerkmal", "grad", "satz"],
    )


def lade_satzdatenbank(pfad: "str | None" = None) -> pd.DataFrame:
    """Lädt die gesamte Satzdatenbank (alle erkannten Zielgruppen) als long format."""
    pfad = pfad or config.SATZDATENBANK
    xls = pd.ExcelFile(pfad, engine="openpyxl")
    blattnamen = list(xls.sheet_names)

    teile = []
    for zielgruppe, stichworte in config.SHEET_HINTS.items():
        blatt = _finde_blatt(blattnamen, stichworte)
        if blatt is None:
            continue
        roh = xls.parse(blatt, dtype=object)
        teile.append(_blatt_zu_long(roh, zielgruppe))

    if not teile:
        raise ValueError(
            "Keine bekannten Tabellenblätter gefunden. Erwartet werden Blätter "
            "für Führungskräfte, Mitarbeitende oder Lehrpersonen."
        )
    return pd.concat(teile, ignore_index=True)


@functools.lru_cache(maxsize=4)
def lade_cached(pfad: str, mtime: float) -> pd.DataFrame:
    """Cache-Variante (Schlüssel: Pfad + Änderungszeit), für Streamlit-Reruns."""
    return lade_satzdatenbank(pfad)


# ---------------------------------------------------------------------------
# Abfragen auf dem long-format DataFrame
# ---------------------------------------------------------------------------
def kompetenzbereiche(df: pd.DataFrame, zielgruppe: str) -> list:
    sub = df[df["zielgruppe"] == zielgruppe]
    # Reihenfolge des ersten Auftretens beibehalten.
    return list(dict.fromkeys(sub["kompetenzbereich"].tolist()))


def merkmale(df: pd.DataFrame, zielgruppe: str, kompetenzbereich: str) -> list:
    sub = df[(df["zielgruppe"] == zielgruppe) & (df["kompetenzbereich"] == kompetenzbereich)]
    return list(dict.fromkeys(sub["beobachtungsmerkmal"].tolist()))


def satz(
    df: pd.DataFrame,
    zielgruppe: str,
    kompetenzbereich: str,
    merkmal: str,
    grad: int,
) -> "str | None":
    # Kompetenzbereich gehört zum Schlüssel: dasselbe Beobachtungsmerkmal kann
    # in mehreren Bereichen vorkommen (z. B. 'Fachkompetenz') und unterschiedliche
    # Bausteine haben. Ohne diesen Filter würde der Baustein des ersten Bereichs
    # für alle gleichnamigen Merkmale zurückgegeben.
    sub = df[
        (df["zielgruppe"] == zielgruppe)
        & (df["kompetenzbereich"] == kompetenzbereich)
        & (df["beobachtungsmerkmal"] == merkmal)
        & (df["grad"] == int(grad))
    ]
    if sub.empty:
        return None
    return str(sub.iloc[0]["satz"])
