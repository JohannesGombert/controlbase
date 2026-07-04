# Development Tasks — ControlBase MVP

## Task 1 — Initialize project

- Create Vite React app
- Install dependencies
- Configure TailwindCSS
- Create base folder structure
- Add `.env.local` support

Acceptance criteria:

- App runs locally with `npm run dev`
- Tailwind classes work
- No console errors

## Task 2 — Supabase client

- Create `src/lib/supabaseClient.js`
- Read `VITE_SUPABASE_URL`
- Read `VITE_SUPABASE_PUBLISHABLE_KEY`
- Export configured client

Acceptance criteria:

- Client initializes without hardcoded secrets

## Task 3 — Auth

- Build Login page
- Add email/password or magic link auth
- Add logout
- Add protected routes
- Redirect unauthenticated users to `/login`

Acceptance criteria:

- User can sign in and out
- Private pages are protected

## Task 4 — Layout and navigation

- Create app layout
- Add navigation for Dashboard, Heute, Käufe, Ideen, Review
- Make mobile-first layout

Acceptance criteria:

- Navigation works on mobile and desktop

## Task 5 — Database

- Run `supabase/schema.sql`
- Run `supabase/rls_policies.sql`
- Test row access with logged-in user

Acceptance criteria:

- Tables exist
- RLS enabled
- User can only access own rows

## Task 6 — Today page: check-in

- Create form for daily_checkins
- Load today's existing check-in
- Upsert on save
- Show success/error message

Acceptance criteria:

- User can create and edit today's check-in
- One record per user/date

## Task 7 — Today page: Top 3

- Create form for daily_top3
- Load today's Top 3
- Upsert on save
- Allow marking tasks done

Acceptance criteria:

- User can create and edit Top 3 for today

## Task 8 — Dashboard

- Load current week check-ins
- Load today's Top 3
- Calculate simple status
- Show key cards

Acceptance criteria:

- Dashboard clearly shows if user is on track
- Empty states handled

## Task 9 — Purchases

- Add purchase item form
- List purchase waitlist
- Calculate earliest decision date
- Allow status update

Acceptance criteria:

- Purchase over 300 CHF can be parked
- Item shows 7-day rule status

## Task 10 — Ideas

- Add idea form
- List idea parking entries
- Allow status update
- Show importance/effort/benefit

Acceptance criteria:

- New ideas can be parked without becoming projects

## Task 11 — Weekly Review

- Load current week summary
- Show calculated weekly metrics
- Create/update weekly review

Acceptance criteria:

- Sunday review can be completed
- Weekly metrics are visible

## Task 12 — Charts

- Add basic weight trend chart
- Add cigarettes trend chart
- Add training count display

Acceptance criteria:

- Charts render without breaking empty states

## Task 13 — Netlify deploy

- Connect GitHub repo to Netlify
- Add env vars
- Deploy app
- Test auth and data persistence in production

Acceptance criteria:

- App is accessible via Netlify URL
- Login works
- Data saves in production

## Task 14 — MVP polish

- Improve copy
- Improve mobile spacing
- Add loading states
- Add error states
- Add empty states
- Test on iPhone

Acceptance criteria:

- App is usable daily without friction
