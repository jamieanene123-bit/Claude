"""Zentrale Pfade, Mappings und Konstanten.

Alles, was sich projektweit ändern lässt, lebt hier – damit man Annahmen
(z. B. die 4->2-Gruppierung der Lehrperson-Kompetenzbereiche) an EINER Stelle
anpassen kann, ohne die Logik anzufassen.

Wichtig: Es werden KEINE Zeugnis-Sätze hartcodiert. Sämtliche Textbausteine
stammen aus der Excel-Satzdatenbank. Hier stehen nur Struktur-Konstanten,
Geschlechts-Token (sprachliche Formen) und die wählbaren Schlusssatz-Vorlagen.
"""

from __future__ import annotations

import os

# ---------------------------------------------------------------------------
# Pfade
# ---------------------------------------------------------------------------
APP_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(APP_DIR)
DATA_DIR = os.path.join(BASE_DIR, "data")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

SATZDATENBANK = os.path.join(DATA_DIR, "satzdatenbank.xlsx")

# Word-Vorlagen je Zielgruppe. Nur die Lehrperson-Vorlage ist fertig ausgebaut.
TEMPLATES = {
    "lehrperson": os.path.join(TEMPLATES_DIR, "arbeitszeugnis_lehrperson.docx"),
    "mitarbeitende": os.path.join(TEMPLATES_DIR, "arbeitszeugnis_mitarbeitende.docx"),
    "fuehrungskraft": os.path.join(TEMPLATES_DIR, "arbeitszeugnis_fuehrungskraft.docx"),
}

# ---------------------------------------------------------------------------
# Bewertungs-Mapping
# ---------------------------------------------------------------------------
# UI zeigt 4/3/2/1 (4 = bestes). Intern werden diese auf die Gradcodes der
# Excel gemappt: 4->100, 3->200, 2->300, 1->400 (100 = bestes).
UI_BEWERTUNGEN = [4, 3, 2, 1]
UI_TO_GRADE = {4: 100, 3: 200, 2: 300, 1: 400}
GRADE_TO_UI = {v: k for k, v in UI_TO_GRADE.items()}
GRADE_CODES = [100, 200, 300, 400]

# Lesbare Beschriftung der UI-Note (4 = bestes).
BEWERTUNG_LABELS = {
    4: "4 – sehr gut",
    3: "3 – gut",
    2: "2 – genügend",
    1: "1 – ungenügend",
}

# ---------------------------------------------------------------------------
# Tolerante Tabellenblatt-Erkennung (umlaut-/gross-klein-unabhängig)
# ---------------------------------------------------------------------------
# Schlüssel = interne Zielgruppe, Werte = Stichwörter, die im (normalisierten)
# Blattnamen vorkommen müssen. Normalisierung: lower + Umlaute aufgelöst.
SHEET_HINTS = {
    "fuehrungskraft": ["fuehrungskraft", "fuehrungskraefte", "fuehrung", "leitung"],
    "mitarbeitende": ["mitarbeitende", "mitarbeiter", "mitarbeitend"],
    "lehrperson": ["lehrperson", "lehrpersonen", "lehrer"],
}

# Tolerante Spalten-Erkennung. Die Gradspalten werden NICHT über den Namen,
# sondern über die Codes 100/200/300/400 erkannt (siehe excel_reader).
SPALTEN_HINTS = {
    "kompetenzbereich": ["kompetenzbereich", "kompetenz", "bereich"],
    "beobachtungsmerkmal": ["beobachtungsmerkmal", "merkmal", "beobachtung", "kriterium"],
}

# ---------------------------------------------------------------------------
# 4 -> 2 Gruppierung der Lehrperson-Kompetenzbereiche (ANNAHME, anpassbar)
# ---------------------------------------------------------------------------
# Die Satztabelle hat 4 Lehrperson-Kompetenzbereiche, die Vorlage nur 2 Absätze.
# Zuordnung erfolgt tolerant über Stichwörter im normalisierten Bereichsnamen,
# damit kleine Schreibweise-Unterschiede in der Excel nicht stören.
#
#   Absatz 1 (Unterrichtsqualität)  = Unterrichtsqualität + Schülerorientierung
#   Absatz 2 (Sozialverhalten)      = Zusammenarbeit/Engagement + Organisation/Professionalität
LEHRPERSON_ABSATZ_GRUPPEN = [
    {
        "key": "absatz_unterrichtsqualitaet",
        "titel": "Unterrichtsqualität",
        "bereiche_stichworte": [
            ["unterrichtsqualitaet", "unterricht"],
            ["schuelerorientierung", "schueler", "lernende"],
        ],
    },
    {
        "key": "absatz_sozialverhalten",
        "titel": "Sozialverhalten",
        "bereiche_stichworte": [
            ["zusammenarbeit", "engagement"],
            ["organisation", "professionalitaet", "professionell"],
        ],
    },
]

# ---------------------------------------------------------------------------
# Geschlechts-Token (sprachliche Formen)
# ---------------------------------------------------------------------------
# WICHTIG: explizite Token-Map – KEIN simples split("/").
# Die Satztabelle nutzt die Reihenfolge weiblich/männlich; in Vorlagen kommt
# teils männlich/weiblich vor. Deshalb wird hier pro bekanntem Token explizit
# (weiblich, männlich) hinterlegt. Unbekannte Schrägstriche (z. B. "und/oder",
# "50/50", Datumsangaben) bleiben unangetastet.
#
# Bei "Divers/keine Angabe" bleiben die zweigeschlechtlichen Formen erhalten
# (das Token wird unverändert gelassen).
GENDER_TOKENS = {
    # Personalpronomen Nominativ
    "sie/er": ("sie", "er"),
    "Sie/Er": ("Sie", "Er"),
    # Personalpronomen Dativ/Akkusativ
    "ihr/ihm": ("ihr", "ihm"),
    "Ihr/Ihm": ("Ihr", "Ihm"),
    "sie/ihn": ("sie", "ihn"),
    "Sie/Ihn": ("Sie", "Ihn"),
    # Possessiv (verschiedene Deklinationen), weiblich/männlich
    "ihr/sein": ("ihr", "sein"),
    "Ihr/Sein": ("Ihr", "Sein"),
    "ihre/seine": ("ihre", "seine"),
    "Ihre/Seine": ("Ihre", "Seine"),
    "ihren/seinen": ("ihren", "seinen"),
    "Ihren/Seinen": ("Ihren", "Seinen"),
    "ihrem/seinem": ("ihrem", "seinem"),
    "Ihrem/Seinem": ("Ihrem", "Seinem"),
    "ihrer/seiner": ("ihrer", "seiner"),
    "Ihrer/Seiner": ("Ihrer", "Seiner"),
    "ihres/seines": ("ihres", "seines"),
    "Ihres/Seines": ("Ihres", "Seines"),
    # Anrede / Substantive (weiblich/männlich)
    "Frau/Herr": ("Frau", "Herr"),
    "Lehrerin/Lehrer": ("Lehrerin", "Lehrer"),
    "Mitarbeiterin/Mitarbeiter": ("Mitarbeiterin", "Mitarbeiter"),
    "Kollegin/Kollege": ("Kollegin", "Kollege"),
    "Vorgesetzte/Vorgesetzter": ("Vorgesetzte", "Vorgesetzter"),
}

# Platzhalter in den Satzbausteinen, der durch die Anrede + Nachname ersetzt
# wird (z. B. "Frau Beispiel" / "Herr Beispiel"). Gross-/Kleinschreibung egal.
NAME_PLATZHALTER = "[Name]"

# Anrede-Optionen der UI -> Geschlecht ("w" | "m" | "d").
ANREDE_OPTIONEN = {
    "Frau": "w",
    "Herr": "m",
    "Divers / keine Angabe": "d",
}

# Sprachliche Default-Formen für die einfachen Vorlagen-Variablen
# (pron_er_sie, poss_sein_ihr). Bei "d" bleiben beide Formen erhalten.
PRONOMEN = {
    "w": {"pron_er_sie": "sie", "poss_sein_ihr": "ihre"},
    "m": {"pron_er_sie": "er", "poss_sein_ihr": "seine"},
    "d": {"pron_er_sie": "sie/er", "poss_sein_ihr": "ihre/seine"},
}

# ---------------------------------------------------------------------------
# Schlusssätze (frei überschreibbar in der UI)
# ---------------------------------------------------------------------------
SCHLUSSSAETZE = {
    "Standard": (
        "[Name] verlässt uns auf eigenen Wunsch. Wir danken ihr/ihm für die "
        "geleistete Arbeit und wünschen ihr/ihm für die berufliche wie private "
        "Zukunft alles Gute und weiterhin viel Erfolg."
    ),
    "Mit Bedauern": (
        "Wir bedauern den Weggang von [Name] sehr. Wir danken ihr/ihm für "
        "ihre/seine wertvolle Arbeit und wünschen ihr/ihm für die Zukunft "
        "alles Gute und weiterhin viel Erfolg."
    ),
    "Auf eigenen Wunsch": (
        "Das Arbeitsverhältnis wird auf Wunsch von [Name] aufgelöst. Wir danken "
        "ihr/ihm für die geleistete Arbeit und wünschen ihr/ihm für die Zukunft "
        "alles Gute."
    ),
    "Befristet (Vertragsende)": (
        "Das befristete Arbeitsverhältnis endet vereinbarungsgemäss. Wir danken "
        "[Name] für ihren/seinen Einsatz und wünschen ihr/ihm für die Zukunft "
        "alles Gute und weiterhin viel Erfolg."
    ),
}

# Optionale Sonderabsätze (befristet / mit besonderen Aufgaben / Zusatzfunktion).
# Werden nur eingefügt, wenn in der UI aktiviert; sonst leerer String.
VERTRAG_ABSATZ_VORLAGE = (
    "Das Arbeitsverhältnis war von Beginn an bis zum [Austrittsdatum] befristet."
)
