"""Benutzerfreundliche Prüfungen.

Liefert verständliche Hinweise (keine Tracebacks) zurück. Unterschieden wird
zwischen ``fehler`` (verhindern den Export) und ``hinweise`` (nur Info).
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field

from . import config


@dataclass
class PruefErgebnis:
    fehler: list = field(default_factory=list)
    hinweise: list = field(default_factory=list)

    @property
    def ok(self) -> bool:
        return not self.fehler


def pruefe_dateien() -> PruefErgebnis:
    """Existieren Satzdatenbank und (mindestens) die Lehrperson-Vorlage?"""
    erg = PruefErgebnis()
    if not os.path.exists(config.SATZDATENBANK):
        erg.fehler.append(
            "Satzdatenbank nicht gefunden: data/satzdatenbank.xlsx. "
            "Eigene Datei dort ablegen oder generate_assets.py ausführen."
        )
    tmpl = config.TEMPLATES["lehrperson"]
    if not os.path.exists(tmpl):
        erg.fehler.append(
            "Word-Vorlage nicht gefunden: templates/arbeitszeugnis_lehrperson.docx. "
            "Eigene Vorlage dort ablegen oder generate_assets.py ausführen."
        )
    return erg


def pruefe_eingaben(personalien: dict) -> PruefErgebnis:
    """Prüft die Personalien-Eingaben aus dem Formular."""
    erg = PruefErgebnis()

    if not (personalien.get("voller_name") or "").strip():
        erg.fehler.append("Bitte den vollständigen Namen angeben.")

    anrede = (personalien.get("anrede") or "").strip()
    if anrede not in config.ANREDE_OPTIONEN:
        erg.fehler.append("Bitte eine gültige Anrede wählen.")
    elif config.ANREDE_OPTIONEN[anrede] == "d":
        erg.hinweise.append(
            "Anrede 'Divers / keine Angabe': geschlechtsabhängige Formen "
            "(z. B. 'sie/er') bleiben zweigeschlechtlich stehen."
        )

    if not (personalien.get("funktion") or "").strip():
        erg.hinweise.append("Funktion ist leer – im Zeugnis bleibt das Feld dann frei.")

    return erg


def pruefe_absaetze(absaetze: dict) -> PruefErgebnis:
    """Warnt, wenn ein Absatz leer bleibt (keine Bewertung/kein Baustein)."""
    erg = PruefErgebnis()
    for gruppe in config.LEHRPERSON_ABSATZ_GRUPPEN:
        key = gruppe["key"]
        if not (absaetze.get(key) or "").strip():
            erg.hinweise.append(
                f"Absatz '{gruppe['titel']}' ist leer – wurde dazu eine Bewertung gewählt?"
            )
    return erg
