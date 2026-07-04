# Architecture — ControlBase

## Overview

ControlBase is a static React frontend hosted on Netlify with Supabase as backend for auth and PostgreSQL database.

```txt
Browser / iPhone / Desktop
        |
        v
Netlify-hosted React app
        |
        v
Supabase Auth + PostgreSQL + RLS
```

## Frontend

Recommended:

- React + Vite
- TailwindCSS
- react-router-dom
- Recharts
- lucide-react
- date-fns

## Backend

Supabase provides:

- Authentication
- PostgreSQL
- Row Level Security
- API access via supabase-js

## Authentication

MVP options:

1. Email/password
2. Magic link

For simplicity, email/password is acceptable. Magic link is more frictionless but requires email configuration.

## Routing

Suggested routes:

```txt
/login
/dashboard
/heute
/kaeufe
/ideen
/wochenreview
```

Default authenticated route: `/dashboard`.

## Data ownership

Every private table includes `user_id uuid references auth.users(id)`.

All queries must filter by authenticated user via RLS.

## Data fetching approach

For MVP, use simple service files:

```txt
services/checkins.js
services/top3.js
services/purchases.js
services/ideas.js
services/reviews.js
services/ceoBlocks.js
```

Each service should expose plain functions:

```js
getTodayCheckin(userId, date)
upsertTodayCheckin(payload)
getCheckinsForRange(userId, startDate, endDate)
```

## Status calculation

Keep scoring simple.

Example daily status:

Green if:

- check-in exists
- no alcohol on weekday
- food quality is sauber or mittel
- at least one Top 3 task done

Yellow if:

- partial data
- food quality mittel/schlecht
- steps below target
- Top 3 partial

Red if:

- no check-in
- alcohol outside rule
- no Top 3 completed
- repeated missed days

MVP status should be understandable, not mathematically perfect.

## Date handling

User is in Europe/Rome / Switzerland-compatible timezone context. Use local browser dates for MVP. Store dates as SQL `date`, not timestamp, for daily records.

Avoid timezone complexity unless building reminders later.

## Charts

MVP dashboard charts:

- Weight over time
- Cigarettes per day
- Alcohol days this week
- Training count this week

Use Recharts. Avoid complex charting.

## Deployment

Netlify:

- Build: `npm run build`
- Publish: `dist`
- Env vars:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Environment variables

Never commit real Supabase credentials.

Use:

```txt
.env.local
```

for local dev and Netlify UI for production.

## Error handling

Show simple German messages:

- "Speichern fehlgeschlagen. Bitte erneut versuchen."
- "Daten konnten nicht geladen werden."
- "Du bist nicht angemeldet."

## Performance

MVP has tiny data volume. No pagination needed except maybe future purchase/idea history.

## Accessibility

- Use labels for form inputs.
- Buttons must have visible text.
- Status should not rely on color alone.
- Keep contrast high.
