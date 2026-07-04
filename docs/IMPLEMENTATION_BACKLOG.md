# ControlBase Implementation Backlog

This backlog is ordered for Claude Code/Codex. Build in sequence. Do not start WHOOP or future modules before MVP acceptance criteria pass.

## Phase 0 — Repository Foundation

### CB-001 Create React/Vite app foundation
- Use React + Vite + TypeScript.
- Add TailwindCSS.
- Add React Router.
- Add Supabase client wrapper.
- Add Recharts.
- Add lucide-react icons.

Acceptance:
- `npm run dev` starts locally.
- `npm run build` succeeds.
- No secrets are committed.

### CB-002 Add app layout
Pages:
- Dashboard
- Heute
- Käufe
- Ideen
- Wochenreview
- Einstellungen

Acceptance:
- Navigation works on mobile and desktop.
- Active route is visually clear.
- Layout is usable on iPhone width.

### CB-003 Add authentication
- Supabase email/password auth.
- Protect all app routes.
- Public routes: login/register only.

Acceptance:
- Logged-out users cannot access private pages.
- Logged-in users can log out.

## Phase 1 — MVP Tracking

### CB-004 Daily check-in CRUD
- Create/update today's check-in.
- Load existing record if present.
- Keep the form short.

Acceptance:
- One record per user per date.
- Save feedback is visible.
- Validation prevents impossible values.

### CB-005 Top 3 tasks
- Create/update daily business, health, private tasks.
- Mark each task complete/incomplete.

Acceptance:
- Dashboard shows completion status.
- Heute page allows editing.

### CB-006 Dashboard summary
Cards:
- Today status
- Weight trend
- Training this week
- Alcohol days this week
- Cigarettes average
- Top 3 completion
- Open purchase decisions

Acceptance:
- Missing data is handled gracefully.
- No empty broken charts.

### CB-007 Purchase waitlist
- Add purchase over 300 CHF.
- Auto-calculate decision date + 7 days.
- Status: waiting, approved, rejected, postponed.

Acceptance:
- Waiting purchases cannot be marked approved before decision date unless user confirms override.
- Dashboard shows due decisions.

### CB-008 Idea parking lot
- Add idea.
- Fields: category, importance, effort, benefit, status.
- Sort by created date and benefit/effort.

Acceptance:
- Ideas are parked by default.
- Status changes work.

### CB-009 Weekly review
- Create weekly review for current week.
- Show auto-summary from daily check-ins.
- Manual reflection fields.

Acceptance:
- One review per user per week_start.
- Sunday UX is simple.

## Phase 2 — Hardening

### CB-010 Row Level Security validation
- Confirm every user-owned table has RLS enabled.
- Confirm user can only access own data.

Acceptance:
- RLS policies exist for select/insert/update/delete.
- No public read policy for private health data.

### CB-011 Netlify deployment
- Add `netlify.toml`.
- Document environment variables.
- Build command: `npm run build`.
- Publish directory: `dist`.

Acceptance:
- Deploy works with Netlify.
- Refreshing protected routes does not 404.

### CB-012 UX copy and warning logic
- Add gentle but direct German warnings.
- Warnings must be behavioral, not shaming.

Acceptance:
- 3 missing check-ins warning.
- 2+ alcohol days warning.
- Missed CEO blocks warning.
- Purchase waitlist warning.

## Phase 3 — Optional WHOOP Prep

### CB-013 WHOOP connection UI placeholder
- Settings page shows WHOOP as disabled/coming soon if feature flag off.
- Do not implement OAuth in MVP.

Acceptance:
- WHOOP UI does not break app.
- Feature flag controls visibility.

### CB-014 WHOOP Netlify function skeleton
- Create placeholder function files only if explicitly requested.
- Never expose WHOOP client secret to frontend.

Acceptance:
- Function reads env vars server-side.
- Frontend calls own function, not WHOOP directly.
