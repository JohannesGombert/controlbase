# WHOOP Implementation Tasks

Use this checklist only after the base ControlBase MVP is working.

## Phase 0 — Preparation now

- [ ] Keep WHOOP out of MVP blocking path.
- [ ] Add `docs/WHOOP_INTEGRATION.md` to repo.
- [ ] Add `supabase/whoop_schema.sql` but do not run it unless implementing WHOOP.
- [ ] Add feature flag `VITE_ENABLE_WHOOP=false`.
- [ ] Add Settings page placeholder: “WHOOP Integration vorbereitet”.

## Phase 1 — WHOOP developer app

- [ ] Create WHOOP Developer app.
- [ ] Add redirect URL: `https://<site>/.netlify/functions/whoop-callback`.
- [ ] Add webhook URL later: `https://<site>/.netlify/functions/whoop-webhook`.
- [ ] Configure minimal scopes: `read:recovery`, `read:sleep`, `read:workout`, `read:cycles`, optionally `offline`.
- [ ] Add Netlify env vars for WHOOP client ID/secret and Supabase service role key.

## Phase 2 — Database

- [ ] Run `supabase/whoop_schema.sql`.
- [ ] Confirm RLS is enabled.
- [ ] Confirm browser cannot read token columns from `whoop_connections`.
- [ ] Confirm metrics are readable only by owning user.

## Phase 3 — OAuth functions

- [ ] Implement `netlify/functions/whoop-start-auth.ts`.
- [ ] Implement state generation and validation.
- [ ] Implement `netlify/functions/whoop-callback.ts`.
- [ ] Exchange authorization code for access/refresh token server-side.
- [ ] Store tokens server-side only.
- [ ] Redirect back to `/settings/integrations?whoop=connected`.

## Phase 4 — Manual sync

- [ ] Implement `netlify/functions/whoop-sync.ts`.
- [ ] Refresh token when close to expiry.
- [ ] Fetch last 14 days of cycle, recovery, sleep and workout.
- [ ] Normalize response into `whoop_daily_metrics` and `whoop_workouts`.
- [ ] Log sync success/failure in `whoop_sync_log`.
- [ ] Add “Jetzt synchronisieren” button in UI.

## Phase 5 — Dashboard integration

- [ ] Add WHOOP card only when connected.
- [ ] Show recovery, sleep performance, HRV, RHR and strain.
- [ ] Add training recommendation based on traffic-light logic.
- [ ] Add warnings for low recovery + alcohol or high strain + low recovery.

## Phase 6 — Scheduled sync

- [ ] Add Netlify Scheduled Function for daily sync.
- [ ] Fetch last 3 days on each scheduled sync.
- [ ] Respect WHOOP rate limits.
- [ ] Avoid duplicate rows with upsert logic.

## Phase 7 — Webhooks later

- [ ] Implement `whoop-webhook.ts` only after manual sync is stable.
- [ ] Validate webhook signatures.
- [ ] Treat webhook as update signal only.
- [ ] Fetch final object data from WHOOP API.

## Done criteria

- [ ] Connect/disconnect works.
- [ ] Manual sync works.
- [ ] Tokens are not exposed to frontend.
- [ ] Dashboard displays clear, useful WHOOP data.
- [ ] Daily check-in remains under 2 minutes.
