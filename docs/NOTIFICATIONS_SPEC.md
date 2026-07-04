# Notifications & Reminder Strategy

## Principle
No nagging. No shame. Reminders should help the user return to the system.

## MVP
In-app warnings only.

## Later Options
1. Email reminders via Supabase Edge Function or Netlify scheduled function.
2. Browser notifications after PWA setup.
3. Calendar-based reminders for CEO blocks.
4. Weekly email summary.

## Reminder Rules

### Daily check-in reminder
Trigger if no check-in exists by configured evening time.
Message:
"Heute fehlt dein Check-in. Zwei Minuten reichen. Nicht ausweichen."

### Missing 3 days
Trigger if no check-in for 3 consecutive days.
Message:
"Du bist aus dem System gerutscht. Heute nur eintragen — nicht perfekt machen."

### Sunday weekly review
Trigger Sundays.
Message:
"Wochenreview offen. 30 Minuten Klarheit für die nächste Woche."

### Purchase decision due
Trigger on earliest_decision_date.
Message:
"7 Tage sind vorbei. Willst du es noch wirklich — oder war es nur Impuls?"

### CEO block missed
Trigger if planned CEO block is not completed.
Message:
"CEO-Zeit verpasst. Nächste Woche zuerst blocken, dann operativ arbeiten."
