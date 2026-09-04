# Prompts & Antwortschema

Spezifikation des KI-Aufrufs, der aus dem Foto eines Behördenbriefs den
**Brieftyp**, die **Frist** und eine **Handlungsempfehlung** herausliest.

Die zulässigen Brieftypen stehen in [`BEHOERDEN.md`](BEHOERDEN.md) — diese
Datei referenziert sie, dupliziert sie aber nicht.

## Design-Entscheidungen

| Entscheidung | Begründung |
|---|---|
| **Ein API-Call, nicht zwei** | Klassifizierung und Extraktion laufen in derselben Anfrage — spart Kosten und Latenz. |
| **Geschlossene Kategorie-Liste** | Die KI wählt einen Wert aus der Taxonomie oder `unklar`. Freitext-Klassifizierung („das scheint ein Amtsbrief zu sein") ist nicht verwertbar. |
| **Eine gemeinsame Sicherheit** | `sicherheit` gilt für Klassifizierung **und** Frist zusammen. Ist eines von beiden unsicher, ist das Gesamtergebnis unsicher. |
| **Nie raten** | Eine unlesbare Frist wird als `null` plus niedriger `sicherheit` gemeldet, nie erfunden. |

> **Spätere Optimierung (kein Pflichtstück für den Prototyp):** ein
> Zwei-Schritt-Ansatz — erst klassifizieren, dann mit einem auf den Brieftyp
> zugeschnittenen Prompt gezielt extrahieren. Erst umsetzen, falls sich die
> Erkennung bei schwierigen Fotos als unzuverlässig erweist.

## Antwortschema

```ts
import { z } from 'zod'

// 1:1 die enum-Spalte aus BEHOERDEN.md. Änderungen nur dort beginnen.
export const BRIEFTYPEN = [
  'steuern',
  'betreibung',
  'busse_strafbefehl',
  'gericht',
  'migration',
  'sozialversicherung',
  'arbeit_alv',
  'krankenversicherung',
  'sozialhilfe',
  'strassenverkehr',
  'militaer_zivildienst',
  'gemeinde_einwohner',
  'bau_wohnen',
  'bildung_stipendien',
  'gebuehren_abgaben',
  'unklar',
] as const

export const SCHWELLE_HINWEIS = 70  // darunter ist unsicherheits_hinweis Pflicht
export const SCHWELLE_WARNUNG = 50  // darunter wird das Ergebnis prominent als unsicher markiert

export const AntwortSchema = z
  .object({
    // — bestehend —
    frist: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    handlungsempfehlung: z.string().min(1),

    // — neu: Erweiterung „Erkennung" —
    brieftyp: z.enum(BRIEFTYPEN),
    sicherheit: z.number().int().min(0).max(100),
    unsicherheits_hinweis: z.string().min(1).nullable(),
  })
  .refine(
    (a) => a.sicherheit >= SCHWELLE_HINWEIS || a.unsicherheits_hinweis !== null,
    { path: ['unsicherheits_hinweis'], message: 'Unter dem Schwellwert ist ein Hinweis Pflicht.' },
  )
```

Führt das reale Schema weitere Felder (z. B. `absender`, `betreff`), bleiben
diese unberührt — die Erweiterung ergänzt ausschliesslich die drei neuen Felder.

### Feld-Semantik

| Feld | Bedeutung |
|---|---|
| `frist` | Das letzte Datum, an dem gehandelt werden muss, als `YYYY-MM-DD`. `null`, wenn keine Frist im Brief steht **oder** sie nicht sicher lesbar ist. |
| `handlungsempfehlung` | Ein Satz in Du-Form, was konkret zu tun ist. Auch bei `unklar` gefüllt (dann: Brief neu fotografieren / selbst prüfen). |
| `brieftyp` | Genau ein Wert aus `BRIEFTYPEN`. Nie Freitext, nie mehrere. |
| `sicherheit` | 0–100, Konfidenz für Brieftyp **und** Frist gemeinsam. Das Minimum der beiden Einzel-Einschätzungen, nicht der Durchschnitt. |
| `unsicherheits_hinweis` | Ein Satz, *warum* das Ergebnis unsicher ist — konkret und überprüfbar („Das Fristdatum ist vom Umschlag verdeckt"), nicht generisch („könnte falsch sein"). `null`, wenn `sicherheit >= 70`. |

## System-Prompt

`{{KATEGORIEN}}` wird zur Laufzeit aus der Tabelle in `BEHOERDEN.md` erzeugt
(je Zeile: `enum` — Kategorie — typische Absender), damit Prompt und Taxonomie
nicht auseinanderdriften.

```text
Du liest das Foto eines Schweizer Behördenbriefs und gibst strukturierte Daten zurück.

Gehe in dieser Reihenfolge vor:

1. BRIEFTYP: Bestimme zuerst den Brieftyp aus der folgenden Liste. Massgeblich ist
   der Absender im Briefkopf, nicht das inhaltliche Thema. Wähle genau einen Wert.
   Wenn du dich nicht entscheiden kannst oder der Brief zu keiner Kategorie passt,
   gib "unklar" zurück. Erfinde niemals eine eigene Kategorie.

{{KATEGORIEN}}

2. FRIST: Suche das Datum, bis zu dem gehandelt werden muss, und gib es als
   YYYY-MM-DD zurück. Rate niemals eine Frist. Kannst du sie nicht sicher lesen
   oder enthält der Brief keine, gib null zurück und kennzeichne das über einen
   niedrigen Sicherheitswert.

3. HANDLUNGSEMPFEHLUNG: Ein Satz in Du-Form, was konkret zu tun ist.

4. SICHERHEIT: Schätze "sicherheit" als Prozentwert von 0 bis 100 für Brieftyp und
   Frist GEMEINSAM ein. Ist eines von beidem unsicher, ist das Gesamtergebnis
   unsicher — nimm den niedrigeren der beiden Werte, nicht den Durchschnitt.
   Vergib einen niedrigeren Wert bei schlechter Bildqualität, ungewöhnlichem
   Format oder mehrdeutigem Inhalt.

5. UNSICHERHEITS_HINWEIS: Liegt "sicherheit" unter 70, formuliere in einem Satz
   klar, WAS unsicher ist und WARUM ("Das Fristdatum ist unscharf und könnte
   auch der 18.09. sein"). Liegt sie bei 70 oder darüber, gib null zurück.

Ein selbstbewusst präsentiertes, falsches Datum ist der schlimmste Fehler.
Eine ehrlich als unsicher markierte Angabe ist immer besser als eine geratene.

Antworte ausschliesslich mit JSON nach dem vorgegebenen Schema.
```

## Darstellung in der UI

`sicherheit` ist ein **dauerhaftes Modellfeld**, kein Alpha-Provisorium. Es ist
der zentrale Schutzmechanismus gegen den Haftungsfall „KI präsentiert eine
falsche Frist mit vollem Selbstbewusstsein". Es wird nie ersatzlos gestrichen.

An die Projektphase gekoppelt ist **ausschliesslich die Darstellung** — die
Warnlogik (Schwellwert überschritten ja/nein) bleibt in beiden Phasen exakt
gleich.

| | Alpha (jetzt) | Ab Beta (normale Nutzer) |
|---|---|---|
| Prozentwert in der UI | **ja**, roh — „Sicherheit: 62%" | **nein**, nie |
| Hinweis unter dem Schwellwert | roher `unsicherheits_hinweis` | freundlicher Text, z. B. „Dieser Brief war schwer zu lesen — bitte prüfe die Angaben zusätzlich selbst." |
| Feld im Datenmodell | vorhanden | vorhanden |
| Feld in der API-Antwort | vorhanden | vorhanden |
| Schwellwert-Logik | `sicherheit < 70` | `sicherheit < 70` (identisch) |

Umgesetzt über einen einzigen Schalter, damit der Phasenwechsel keine Logik
anfasst:

```js
const PHASE = 'alpha' // 'alpha' | 'beta'

const zeigeProzent = PHASE === 'alpha'
const istUnsicher  = antwort.sicherheit < SCHWELLE_HINWEIS   // in beiden Phasen gleich
const istKritisch  = antwort.sicherheit < SCHWELLE_WARNUNG   // in beiden Phasen gleich
```

## Fehlerfälle

| Fall | Verhalten |
|---|---|
| Antwort verletzt das Schema | Einmal wiederholen. Scheitert es erneut: Fehlermeldung anzeigen, **kein** Teilergebnis mit erfundenen Feldern. |
| `brieftyp` nicht in der Liste | Schema-Fehler → wie oben. Nicht auf `unklar` umbiegen, das verdeckt Prompt-Fehler. |
| `sicherheit < 70`, aber `unsicherheits_hinweis === null` | Schema-Fehler → wie oben. |
| `frist === null` | Kein Fehler. Ergebnis ohne Frist anzeigen, keine Erinnerung setzen. |
| `sicherheit < 50` | Ergebnis anzeigen, aber prominent als unsicher markieren und keine automatische Erinnerung auf die Frist setzen. |

## Pflicht-Testfälle

Sechs Fälle, alle **visuell im Browser prüfbar** — niemand muss dafür Code lesen.

| # | Testbrief | erwarteter `brieftyp` | `frist` | `sicherheit` | Prüfpunkt |
|---|---|---|---|---|---|
| 1 | Steuererklärung / Veranlagung des kantonalen Steueramts | `steuern` | Datum aus dem Brief | ≥ 70 | Kategorie korrekt, kein Hinweis sichtbar |
| 2 | Zahlungsbefehl des Betreibungsamts | `betreibung` | Datum aus dem Brief | ≥ 70 | Kategorie korrekt — **nicht** `steuern`, auch wenn es um eine Steuerschuld geht |
| 3 | Ordnungsbusse / Strafbefehl | `busse_strafbefehl` | Datum aus dem Brief | ≥ 70 | Kategorie korrekt — **nicht** `strassenverkehr` |
| 4 | Verfügung zur Prämienverbilligung | `krankenversicherung` | Datum aus dem Brief | ≥ 70 | Kategorie korrekt — **nicht** `sozialversicherung` |
| 5 | Verlängerung der Aufenthaltsbewilligung (Migrationsamt) | `migration` | Datum aus dem Brief | ≥ 70 | Kategorie korrekt, Frist stimmt mit dem Brief überein |
| 6 | **Neu:** bewusst mehrdeutiges oder schlecht lesbares Foto (unscharf, Briefkopf abgeschnitten) | `unklar` **oder** eine Kategorie mit niedriger Sicherheit | `null` | < 50 | Kein erfundenes Datum. `unsicherheits_hinweis` benennt konkret, was fehlt. |

> Die Spalte *Testbrief* beschreibt die fünf bestehenden Pflicht-Testfälle plus
> den neuen sechsten. Weichen die realen Testbriefe inhaltlich ab, wird nur
> diese Spalte angepasst — erwartete Kategorie, Struktur und Abnahme-Kriterium
> bleiben unverändert.

### Abnahme-Kriterium

Alle 6 Fälle zeigen im Browser die richtige Kategorie bzw. korrekt den
Unsicherheits-Hinweis, **ohne dass jemand dafür den Code lesen muss.**

Pro Testbrief muss auf dem Ergebnis-Bildschirm sichtbar sein:

1. Das **Kategorie-Label** im Klartext (z. B. „Betreibung & Inkasso"), nicht der
   `enum`-Wert.
2. Der **Sicherheitswert in Prozent** (Alpha-Phase).
3. Bei `sicherheit < 70`: der **Hinweistext**, deutlich abgesetzt.
4. Die **Frist** als Datum — oder sichtbar „keine Frist erkannt", nie leer und
   nie ein Platzhalter, der wie ein Datum aussieht.

Fall 6 gilt nur dann als bestanden, wenn **kein** Datum als Frist erscheint.
Eine erfundene Frist ist ein Fehlschlag, auch wenn Kategorie und Hinweis stimmen.
