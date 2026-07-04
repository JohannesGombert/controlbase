# AGENTS.md — ControlBase Development Instructions

These instructions are for AI coding agents such as Claude Code, Codex, Cursor, or similar tools.

## Project identity

Project name: ControlBase  
Language: German UI  
Purpose: A private personal control dashboard for health, discipline, finances, purchases, ideas, and CEO focus.

The app should answer one primary question every day:

> Bin ich heute auf Kurs?

## User context

The intended user is a German-speaking CEO living in Switzerland. He wants a realistic, strict but sustainable personal control system starting from a 30-day plan. The app must reduce friction, not create another complex project.

## Core product principles

1. Mobile-first.
2. Daily check-in must take less than 2 minutes.
3. Keep the MVP intentionally small.
4. Prefer clarity over features.
5. No public sharing.
6. No social functionality.
7. No complex gamification in MVP.
8. German labels and copy.
9. The product should be direct, honest, and slightly strict in tone.
10. Avoid over-engineering.

## Recommended stack

- React + Vite
- TailwindCSS
- react-router-dom
- Supabase Auth + PostgreSQL
- Recharts for charts
- lucide-react for icons
- date-fns for date handling
- Netlify for hosting

## MVP pages

Build only these pages first:

1. Dashboard
2. Heute
3. Käufe
4. Ideen
5. Wochenreview

Do not build advanced pages until the MVP works end-to-end.

## Coding standards

- Use functional React components.
- Use clear component names.
- Keep files small.
- Keep business logic in helper functions where possible.
- Use environment variables for Supabase keys.
- Do not hardcode secrets.
- Never expose Supabase service role keys in the frontend.
- Use Row Level Security in Supabase.
- Use accessible form labels.
- Use simple loading and error states.
- Avoid unnecessary animation.

## Suggested folder structure

```txt
src/
  app/
    App.jsx
    router.jsx
  components/
    Layout.jsx
    Nav.jsx
    StatCard.jsx
    StatusBadge.jsx
    FormField.jsx
  lib/
    supabaseClient.js
    date.js
    scoring.js
  pages/
    Dashboard.jsx
    Today.jsx
    Purchases.jsx
    Ideas.jsx
    WeeklyReview.jsx
    Login.jsx
  services/
    checkins.js
    top3.js
    purchases.js
    ideas.js
    reviews.js
  styles/
    index.css
```

## UX tone

Use clear German wording. Examples:

- "Heute auf Kurs"
- "Nicht diskutieren, eintragen."
- "7-Tage-Regel aktiv"
- "Du rutschst zurück ins Operative"
- "Erst parken, dann entscheiden"

Avoid overly motivational generic text.

## MVP data entities

- daily_checkins
- daily_top3
- purchase_waitlist
- idea_parking
- weekly_reviews
- ceo_blocks

## Status logic

Dashboard should use simple status colors:

- green: on track
- yellow: partial / warning
- red: off track

Do not make the scoring too complicated in MVP.

## Critical MVP constraints

- Do not add payment systems.
- Do not add multi-user admin panels.
- Do not add external health integrations.
- Do not add AI analysis calls.
- Do not add notification infrastructure unless explicitly requested later.
- Do not store data in localStorage except temporary UI state.

## Security

- All user-owned tables must have `user_id`.
- RLS must ensure users can only read/write their own rows.
- The app must require login for all private pages.
- Public access only for login page.

## Definition of done for MVP

The MVP is done when:

1. User can sign in.
2. User can create/update today's check-in.
3. User can create/update today's Top 3.
4. Dashboard shows today's status and weekly summary.
5. User can add purchase waitlist items.
6. Purchase items show earliest decision date.
7. User can add ideas to parking lot.
8. User can create a weekly review.
9. Data persists in Supabase.
10. RLS prevents access to other users' data.
11. App deploys on Netlify Free.

## WHOOP integration guardrails

WHOOP is an optional extension. Do not implement it unless explicitly requested after MVP basics are working.

If implementing WHOOP:

- Never expose WHOOP client secret, access token, refresh token, or Supabase service role key to the frontend.
- Use Netlify Functions or another server-side runtime for OAuth and syncing.
- Store tokens in server-only tables with RLS enabled and no browser-readable token policy.
- Prefer manual sync before scheduled sync or webhooks.
- Keep UI in German.
- Use WHOOP data for trends and self-management only, not medical advice or diagnosis.
