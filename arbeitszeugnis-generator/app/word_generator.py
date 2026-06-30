"""Befüllen der Word-Vorlagen via docxtpl.

Die Vorlage enthält ``{{ jinja }}``-Variablen (in der echten WKVZ-Vorlage durch
Ersetzen der ``[Platzhalter]`` im XML entstanden – Formatierung bleibt erhalten).
Hier werden ausschliesslich diese Variablen befüllt und das Dokument gerendert.
"""

from __future__ import annotations

import io
import os

from docxtpl import DocxTemplate

from . import config


# Die 20 Vorlagen-Variablen (Referenz / Vollständigkeitscheck).
TEMPLATE_VARS = [
    "anrede",
    "voller_name",
    "geburtsdatum",
    "eintrittsdatum",
    "austrittsdatum",
    "funktion",
    "fachbereiche",
    "klassen",
    "pensum",
    "pron_er_sie",
    "poss_sein_ihr",
    "absatz_unterrichtsqualitaet",
    "absatz_sozialverhalten",
    "schlusssatz",
    "vertrag_absatz",
    "zusatz_absatz",
    "strasse_hausnummer",
    "plz_ort",
    "ausstellungsdatum",
    "heimatort",
]


def _vollstaendiger_context(context: dict) -> dict:
    """Stellt sicher, dass jede Vorlagen-Variable existiert (sonst leerer String)."""
    voll = {var: "" for var in TEMPLATE_VARS}
    voll.update({k: ("" if v is None else v) for k, v in context.items()})
    return voll


def rendere(context: dict, template_pfad: "str | None" = None) -> bytes:
    """Rendert die Vorlage mit ``context`` und gibt das .docx als Bytes zurück."""
    template_pfad = template_pfad or config.TEMPLATES["lehrperson"]
    if not os.path.exists(template_pfad):
        raise FileNotFoundError(f"Word-Vorlage nicht gefunden: {template_pfad}")

    doc = DocxTemplate(template_pfad)
    # autoescape=True: XML-Sonderzeichen aus Nutzereingaben (&, <, >, ") werden
    # sicher escaped, sonst werden Werte wie 'Müller & Co.' im Dokument
    # abgeschnitten oder zerstören das XML.
    doc.render(_vollstaendiger_context(context), autoescape=True)
    puffer = io.BytesIO()
    doc.save(puffer)
    return puffer.getvalue()


def speichere(context: dict, dateiname: str, template_pfad: "str | None" = None) -> str:
    """Rendert und speichert in output/. Gibt den Pfad zurück."""
    os.makedirs(config.OUTPUT_DIR, exist_ok=True)
    daten = rendere(context, template_pfad)
    ziel = os.path.join(config.OUTPUT_DIR, dateiname)
    with open(ziel, "wb") as fh:
        fh.write(daten)
    return ziel
