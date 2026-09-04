# Behörden-Taxonomie

Verbindliche, **geschlossene** Kategorie-Liste für die Klassifizierung von
Behördenbriefen. Diese Datei ist die *einzige* Quelle der Wahrheit für das
Feld `brieftyp` im Antwortschema (siehe [`PROMPTS.md`](PROMPTS.md)).

## Grundregeln

1. **Geschlossene Liste, kein Freitext.** Zulässig sind ausschliesslich die
   `enum`-Werte aus der Tabelle unten — plus `unklar`. Eine Antwort wie
   „das scheint ein Amtsbrief zu sein" ist nicht verwertbar und wird von der
   Schema-Validierung abgelehnt.
2. **Immer genau ein Wert.** Auch wenn ein Brief mehrere Themen berührt, wird
   genau eine Kategorie vergeben — siehe [Abgrenzungsregeln](#abgrenzungsregeln).
3. **`unklar` ist ein gültiges Ergebnis, kein Fehler.** Lieber `unklar` mit
   niedriger `sicherheit` als eine falsche Kategorie mit hoher Sicherheit.
4. **Erweiterung nur im Dreierpack.** Neue Kategorie → (a) hier eintragen,
   (b) Enum in `PROMPTS.md` ergänzen, (c) einen Testfall ergänzen. Sonst
   driften Prompt, Schema und Tests auseinander.

## Kategorien

| `enum` | Kategorie | Typische Absender | Typischer Inhalt | Typische Frist |
|---|---|---|---|---|
| `steuern` | Steuern | Kantonales/Gemeindliches Steueramt, ESTV | Steuererklärung, Veranlagung, Schlussrechnung, Akontorechnung, Mahnung | Einreichung ~30.03.; Einsprache **30 Tage**; Fristerstreckung möglich |
| `betreibung` | Betreibung & Inkasso | Betreibungsamt, Konkursamt | Zahlungsbefehl, Pfändungsankündigung, Konkursandrohung | Rechtsvorschlag **10 Tage** ab Zustellung; Zahlungsfrist **20 Tage** |
| `busse_strafbefehl` | Busse & Strafbefehl | Polizei, Staatsanwaltschaft, Bussenzentrale | Ordnungsbusse, Strafbefehl, Vorladung zur Einvernahme | Einsprache Strafbefehl **10 Tage**; Ordnungsbusse zahlen **30 Tage** |
| `gericht` | Gericht & Rechtsmittel | Bezirks-/Kantons-/Bundesgericht, Schlichtungsbehörde | Vorladung, Verfügung, Urteil, Fristansetzung, Kostenvorschuss | Rechtsmittel **10 / 30 Tage**; Kostenvorschuss meist **10–20 Tage** |
| `migration` | Migration & Aufenthalt | Migrationsamt, SEM, Gemeinde | Verlängerung Aufenthaltsbewilligung, Einbürgerung, Auflagen, Wegweisung | Verlängerung **spätestens 14 Tage vor Ablauf**; Beschwerde **30 Tage** |
| `sozialversicherung` | Sozialversicherung (AHV/IV/EL) | Ausgleichskasse, SVA, IV-Stelle | Beitragsverfügung, Rentenentscheid, IV-Abklärung, Ergänzungsleistungen | Einsprache **30 Tage**; Mitwirkung/Unterlagen meist **14–30 Tage** |
| `arbeit_alv` | Arbeitslosigkeit (RAV/ALK) | RAV, Arbeitslosenkasse, AWA | Anmeldung, Kontrollperiode, Nachweis Arbeitsbemühungen, Einstelltage | Arbeitsbemühungen **bis Monatsende**; Einsprache **30 Tage** |
| `krankenversicherung` | Krankenversicherung & Prämienverbilligung | Krankenkasse (KVG), kantonale Prämienverbilligungsstelle | Prämienrechnung, Franchisewechsel, IPV-Verfügung, Mahnung | Kündigung **30.11.**; Einsprache IPV **30 Tage**; Mahnung **30 Tage** |
| `sozialhilfe` | Sozialhilfe | Sozialamt, Sozialdienst der Gemeinde | Unterstützungsentscheid, Kürzung, Rückerstattung, Auflagen | Einsprache **30 Tage**; Unterlagen nachreichen **10–30 Tage** |
| `strassenverkehr` | Strassenverkehr & Fahrzeug | Strassenverkehrsamt, ASTRA | Führerausweisentzug/Verwarnung, MFK-Aufgebot, Fahrzeugausweis, Verkehrssteuer | Stellungnahme **10–20 Tage**; Beschwerde **30 Tage**; MFK-Termin fix |
| `militaer_zivildienst` | Militär, Zivildienst & Schutz | Kreiskommando, Armee, Zivildienststelle, Zivilschutz | Aufgebot, Dienstverschiebung, Wehrpflichtersatz, Ausrüstung | Dienstverschiebung **bis 14 Tage vor Einrücken**; Aufgebot = fixes Datum |
| `gemeinde_einwohner` | Gemeinde & Einwohnerdienste | Einwohnerkontrolle, Gemeindeverwaltung | An-/Abmeldung, Wohnsitzbestätigung, Hundemeldung, Stimmunterlagen | Anmeldung **14 Tage** nach Zuzug; Abstimmung = Termin |
| `bau_wohnen` | Bau, Planung & Wohnen | Bauamt, Baubewilligungsbehörde, Schlichtungsbehörde Miete | Baubewilligung, Baugesuch-Publikation, Einsprache, Mietschlichtung | Einsprache Baugesuch **20–30 Tage**; Anfechtung Mietzins **30 Tage** |
| `bildung_stipendien` | Bildung & Stipendien | Schule, Volksschulamt, Stipendienstelle | Anmeldung, Zuteilung, Stipendien-/Darlehensentscheid, Absenzen | Stipendiengesuch = kantonale Frist; Einsprache **30 Tage** |
| `gebuehren_abgaben` | Gebühren & Abgaben | SERAFE, Werke, Kehricht-/Wasserversorgung, Gemeindekasse | Radio-/TV-Abgabe, Kehricht-, Wasser-, Abwassergebühr, Grundgebühren | Zahlung **30 Tage**; Einsprache/Erlassgesuch **30 Tage** |
| `unklar` | Unklar | — | Nicht eindeutig zuordenbar, unlesbar, kein Behördenbrief | — |

> **Fristen sind Richtwerte.** Sie helfen der Erkennung bei der Plausibilisierung
> — sie ersetzen niemals die im Brief genannte Frist. Steht im Brief ein
> abweichendes Datum, gilt immer das Datum aus dem Brief.

## Wann `unklar`

`brieftyp: "unklar"` ist zu vergeben, wenn **einer** dieser Punkte zutrifft:

- Der Absender ist nicht erkennbar (Briefkopf fehlt, abgeschnitten, unleserlich).
- Das Foto ist so schlecht (unscharf, zu dunkel, verdeckt, stark verzerrt), dass
  der Inhalt nicht sicher gelesen werden kann.
- Der Brief passt zu keiner Kategorie (z. B. Werbung, private Post, Newsletter).
- Zwei oder mehr Kategorien sind gleich plausibel und die Abgrenzungsregeln
  unten lösen den Konflikt nicht auf.

Zusätzlich gilt: **niemals eine Frist raten.** Was nicht sicher lesbar ist,
bleibt `null`. `sicherheit` ist in diesen Fällen niedrig und
`unsicherheits_hinweis` benennt konkret, was fehlt („Der Briefkopf ist auf dem
Foto abgeschnitten").

## Abgrenzungsregeln

Bei mehreren plausiblen Kategorien in dieser Reihenfolge entscheiden:

1. **Absender schlägt Thema.** Massgeblich ist der Briefkopf, nicht das
   inhaltliche Sachgebiet. Eine Steuerforderung auf einem Zahlungsbefehl des
   Betreibungsamts ist `betreibung`, nicht `steuern`.
2. **Verfahrensschritt schlägt Sachgebiet.** Sobald ein förmliches Verfahren
   läuft (Betreibung, Strafbefehl, Gerichtsverfahren), gewinnt dieses.
3. **Der Brief mit der Frist gewinnt.** Enthält ein Schreiben mehrere Themen,
   entscheidet das Thema, an dem die Frist hängt.
4. **Bleibt es offen → `unklar`** mit niedriger `sicherheit`.

Häufige Verwechslungen:

| Fall | Richtig | Nicht |
|---|---|---|
| Zahlungsbefehl über eine Steuerschuld | `betreibung` | `steuern` |
| Geschwindigkeitsbusse der Polizei | `busse_strafbefehl` | `strassenverkehr` |
| Führerausweisentzug nach der Busse (Administrativmassnahme) | `strassenverkehr` | `busse_strafbefehl` |
| Strafbefehl der Staatsanwaltschaft | `busse_strafbefehl` | `gericht` |
| Vorladung oder Urteil eines Gerichts | `gericht` | `busse_strafbefehl` |
| Prämienverbilligungs-Verfügung des Kantons | `krankenversicherung` | `sozialversicherung` |
| Beitragsverfügung der Ausgleichskasse | `sozialversicherung` | `krankenversicherung` |
| Einstelltage / Arbeitsbemühungen des RAV | `arbeit_alv` | `sozialversicherung` |
| Kürzung der wirtschaftlichen Sozialhilfe | `sozialhilfe` | `sozialversicherung` |
| SERAFE-Rechnung (Radio-/TV-Abgabe) | `gebuehren_abgaben` | `steuern` |
| Publikation eines Baugesuchs im Amtsblatt | `bau_wohnen` | `gemeinde_einwohner` |

## Kanton- und Sprachhinweise

- Fristen sind teilweise **kantonal** geregelt (Steuern, Stipendien, IPV). Die
  Kategorien selbst sind kantonsunabhängig — nur die Richtwerte oben variieren.
- Briefe können auf **Deutsch, Französisch, Italienisch** eintreffen. Die
  Kategorie richtet sich nach der Behörde, nicht nach der Sprache:
  *Office des poursuites* → `betreibung`, *Service de la population* →
  `migration`, *Ufficio delle imposte* → `steuern`.
