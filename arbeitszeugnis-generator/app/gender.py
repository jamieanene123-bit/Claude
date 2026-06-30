"""Geschlecht- und Namensauflösung.

Aus der gewählten Anrede werden die sprachlichen Formen in den Satzbausteinen
korrekt gesetzt:

  * der Platzhalter ``[Name]``  ->  "Frau Beispiel" / "Herr Beispiel"
  * geschlechtsabhängige Token  ->  "sie/er" -> "sie" bzw. "er",
    "ihren/seinen" -> "ihren" bzw. "seinen" usw.

Bewusst KEIN simples ``split("/")``: Es werden ausschliesslich die in
``config.GENDER_TOKENS`` hinterlegten Token ersetzt (explizite Token-Map).
Unbekannte Schrägstriche – etwa "und/oder", "50/50" oder "2024/2025" – bleiben
dadurch unangetastet.

Bei "Divers / keine Angabe" (``geschlecht == "d"``) bleiben die
zweigeschlechtlichen Formen erhalten; nur der Name wird gesetzt.
"""

from __future__ import annotations

import re

from . import config


# Token nach Länge absteigend sortieren, damit längere Treffer ("ihren/seinen")
# vor kürzeren ("ihr/sein") greifen und keine Teil-Ersetzungen passieren.
_SORTED_TOKENS = sorted(config.GENDER_TOKENS.keys(), key=len, reverse=True)

# Ein einziges Regex über alle bekannten Token. Begrenzung links/rechts über
# Zeichen, die NICHT zu einem deutschen Wort gehören (inkl. Umlaute), damit z. B.
# "ihre/seiner" nicht fälschlich in "ihre/seine" + "r" zerfällt.
_WORDCHARS = r"A-Za-zÄÖÜäöüß"
_TOKEN_RE = re.compile(
    r"(?<![{wc}])(?:{alts})(?![{wc}])".format(
        wc=_WORDCHARS,
        alts="|".join(re.escape(t) for t in _SORTED_TOKENS),
    )
)


def nachname(voller_name: str) -> str:
    """Letztes Wort des vollen Namens als Nachname (für 'Frau <Nachname>')."""
    teile = (voller_name or "").strip().split()
    return teile[-1] if teile else ""


def anrede_name(geschlecht: str, voller_name: str) -> str:
    """Ersetzungswert für ``[Name]``.

    w -> "Frau <Nachname>", m -> "Herr <Nachname>".
    Bei "d" (divers/keine Angabe) wird der volle Name ohne Anrede verwendet,
    damit keine falsche geschlechtliche Zuschreibung entsteht.
    """
    nn = nachname(voller_name)
    if geschlecht == "w":
        return ("Frau " + nn).strip()
    if geschlecht == "m":
        return ("Herr " + nn).strip()
    # divers / keine Angabe
    return (voller_name or "").strip() or nn


def _ersetze_token(geschlecht: str, text: str) -> str:
    """Ersetzt die bekannten Geschlechts-Token gemäss Token-Map."""
    if geschlecht == "d":
        # Zweigeschlechtliche Formen bewusst erhalten.
        return text

    idx = 0 if geschlecht == "w" else 1

    def _repl(match: "re.Match[str]") -> str:
        token = match.group(0)
        paar = config.GENDER_TOKENS.get(token)
        if paar is None:  # sollte durch das Regex nie passieren
            return token
        return paar[idx]

    return _TOKEN_RE.sub(_repl, text)


def aufloesen(text: str, geschlecht: str, voller_name: str) -> str:
    """Wendet Namens- und Geschlechtsauflösung auf einen Text an.

    Reihenfolge ist unkritisch, da der Name-Platzhalter keine Schrägstriche
    enthält und die Token-Ersetzung nur die bekannten Slash-Token trifft.
    """
    if not text:
        return text
    ersetzt = _ersetze_name(text, geschlecht, voller_name)
    return _ersetze_token(geschlecht, ersetzt)


def _ersetze_name(text: str, geschlecht: str, voller_name: str) -> str:
    wert = anrede_name(geschlecht, voller_name)
    # Platzhalter gross-/kleinschreibungs-unabhängig ersetzen.
    return re.sub(re.escape(config.NAME_PLATZHALTER), wert, text, flags=re.IGNORECASE)


def pronomen(geschlecht: str) -> dict:
    """Einfache Vorlagen-Variablen (pron_er_sie, poss_sein_ihr)."""
    return dict(config.PRONOMEN.get(geschlecht, config.PRONOMEN["d"]))
