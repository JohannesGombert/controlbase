# UI Specification — ControlBase

## Visual direction

ControlBase should feel like a private control cockpit, not a playful habit app.

Keywords:

- clear
- serious
- direct
- calm
- mobile-first
- low friction
- slightly strict

## Color logic

Use neutral base colors with status colors.

- Green: on track
- Yellow: warning / partial
- Red: off track
- Neutral: informational

Do not overuse bright colors.

## Navigation

Mobile-first bottom navigation or simple top nav.

MVP nav items:

```txt
Dashboard
Heute
Käufe
Ideen
Review
```

## Page: Dashboard

Primary headline:

```txt
Heute auf Kurs?
```

Cards:

1. Heute Status
2. Gewichtstrend
3. Training diese Woche
4. Alkoholtage
5. Zigaretten-Schnitt
6. Top-3-Erfüllung
7. CEO-Blöcke
8. Offene Kaufentscheidungen

Card examples:

```txt
Status: Grün
Du bist heute im Plan.
```

```txt
7-Tage-Regel
2 Käufe warten auf Entscheidung.
```

## Page: Heute

Sections:

1. Morgencheck
2. Top 3
3. Abendcheck
4. Notiz

Fields:

### Morgencheck

- Gewicht
- Schlaf: schlecht / okay / gut

### Top 3

- Beruf
- Gesundheit
- Privat/Finanzen
- done checkboxes

### Abendcheck

- Schritte
- Training: nein / Krafttraining / Tennis / Cardio / Spaziergang / Wandern / anderes
- Alkohol: ja/nein
- Zigaretten
- Erste Zigarette um
- Essen: sauber / mittel / schlecht
- Ausgaben über 50 CHF

### Notiz

- Freitext

Primary button:

```txt
Speichern
```

## Page: Käufe

Purpose: reduce impulse purchases.

Fields:

- Artikel
- Preis
- Kategorie
- Warum will ich es?

Display:

- Created date
- Earliest decision date
- Status

Statuses:

- Wartet
- Kaufen erlaubt
- Gekauft
- Verworfen
- Weiter warten

Decision prompts after 7 days:

```txt
Will ich es immer noch?
Zahlt es auf Gesundheit, Beruf oder echte Lebensqualität ein?
Gefährdet es meine Sparquote?
```

## Page: Ideen

Purpose: capture ideas without starting them.

Fields:

- Idee
- Kategorie
- Wichtigkeit 1-5
- Aufwand 1-5
- Nutzen 1-5
- Status

Statuses:

- Geparkt
- Prüfen
- Starten
- Löschen

Warning text:

```txt
Nicht sofort starten. Erst parken, dann im Review bewerten.
```

## Page: Wochenreview

Auto summary:

- Durchschnittsgewicht
- Trainingstage
- Alkoholtage
- Zigaretten-Schnitt
- Tage mit sauberem Essen
- Top-3-Erfüllung
- CEO-Blöcke
- Ausgaben über 50 CHF

Manual questions:

1. Was lief gut?
2. Was hat mich abgelenkt?
3. Was stoppe ich nächste Woche?
4. Ziel 1 nächste Woche
5. Ziel 2 nächste Woche
6. Ziel 3 nächste Woche

## Microcopy

Use direct German wording:

- "Eintragen statt diskutieren."
- "Du bist heute noch nicht sichtbar im Plan."
- "7-Tage-Regel aktiv."
- "Diese Idee ist geparkt. Gut so."
- "Du rutschst zurück ins Operative."
- "Heute zählt Wiederholung, nicht Perfektion."
