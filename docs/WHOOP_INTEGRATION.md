# WHOOP Integration — ControlBase

Status: Optional extension. Do not block MVP.

## Goal

Import selected WHOOP metrics into ControlBase so the daily dashboard can show whether health behavior matches recovery and sleep data.

Primary question:

> Bin ich heute körperlich auf Kurs — oder brauche ich bewusst weniger Belastung?

## MVP decision

WHOOP is **not required for MVP v1**.

Prepare the app architecture now, but implement WHOOP only after the manual daily check-in is stable for at least 14–30 days.

Reason:

- Manual tracking validates the product first.
- OAuth/token handling adds backend and security complexity.
- WHOOP should reduce manual input, not become another unfinished side project.

## Recommended free-stack architecture

ControlBase remains:

- React + Vite frontend
- Supabase Auth + PostgreSQL
- Netlify hosting

WHOOP integration adds:

- Netlify Functions for OAuth callback, token exchange, token refresh, sync jobs, and webhooks
- Supabase tables for WHOOP connection metadata and normalized metrics
- Supabase service role key used only inside Netlify Functions
- WHOOP client secret stored only as Netlify environment variable

Do **not** expose WHOOP client secret or refresh tokens to the browser.

## Required WHOOP developer setup

Create an app in the WHOOP Developer Dashboard.

Required app configuration:

- Redirect URL: `https://<your-netlify-site>/.netlify/functions/whoop-callback`
- Webhook URL, optional later: `https://<your-netlify-site>/.netlify/functions/whoop-webhook`
- Scopes: request only what ControlBase actually uses.

Suggested initial scopes:

- `read:recovery`
- `read:sleep`
- `read:workout`
- `read:cycles`
- `offline` if required to receive refresh tokens for long-lived syncing

## WHOOP API endpoints to support

Base API:

```txt
https://api.prod.whoop.com/developer/v2
```

OAuth URLs:

```txt
Authorization: https://api.prod.whoop.com/oauth/oauth2/auth
Token:         https://api.prod.whoop.com/oauth/oauth2/token
```

Data endpoints:

```txt
GET /cycle
GET /recovery
GET /sleep
GET /workout
```

## Metrics to import

### Recovery

Store one row per recovery/cycle/day when available.

Fields to normalize:

- recovery_score
- hrv_rmssd_milli
- resting_heart_rate
- spo2_percentage
- skin_temp_celsius
- score_state
- cycle_id
- sleep_id
- whoop_updated_at

### Sleep

Fields to normalize:

- sleep_start
- sleep_end
- sleep_performance_percentage
- sleep_consistency_percentage
- sleep_efficiency_percentage
- respiratory_rate
- total_in_bed_minutes
- total_awake_minutes
- total_light_sleep_minutes
- total_slow_wave_sleep_minutes
- total_rem_sleep_minutes
- disturbance_count
- score_state

### Workout

Fields to normalize:

- workout_start
- workout_end
- sport_id
- strain
- average_heart_rate
- max_heart_rate
- kilojoule
- distance_meter
- altitude_gain_meter
- zone_zero_minutes through zone_five_minutes
- score_state

### Cycle / Strain

Fields to normalize:

- cycle_start
- cycle_end
- day_strain
- average_heart_rate
- max_heart_rate
- kilojoule
- score_state

## Dashboard usage

WHOOP should enhance the dashboard, not replace manual check-ins.

Recommended cards:

1. Recovery today
2. Sleep performance
3. Strain yesterday/today
4. HRV trend
5. Resting heart rate trend
6. Training recommendation

## Decision logic

### Recovery traffic light

```txt
Green: recovery_score >= 67
Yellow: recovery_score 34–66
Red: recovery_score <= 33
Unknown: no scored recovery yet
```

### Training recommendation

```txt
Green recovery + good sleep:
  Krafttraining oder Tennis normal möglich.

Yellow recovery:
  Training erlaubt, aber kein Ego-Training. Fokus auf Technik, Zone 2, saubere Ernährung.

Red recovery:
  Kein hartes Training. Schritte, Mobility, Schlaf, Alkohol vermeiden.
```

### ControlBase warnings

- Red recovery + alcohol planned: warn strongly.
- Bad sleep + high cigarettes: show pattern warning.
- High strain + low recovery: recommend lighter day.
- Good recovery + no training for 2+ days: nudge to move.

## Sync strategy

### Phase 1: Manual sync button

Add button in Settings/WHOOP:

```txt
WHOOP verbinden
Jetzt synchronisieren
Verbindung trennen
```

A manual sync fetches the last 14 days:

- `/cycle`
- `/recovery`
- `/sleep`
- `/workout`

This is simplest and safest for MVP+.

### Phase 2: Scheduled sync

Use a Netlify Scheduled Function once daily in the morning, for example 07:30 Europe/Zurich.

Fetch the last 3 days because WHOOP scores can be updated after initial creation.

### Phase 3: Webhooks

Use WHOOP webhooks to receive update events and then fetch the affected objects from WHOOP.

Important:

- Validate webhook signatures.
- Treat webhooks as signals, not source of truth.
- Always fetch final details from WHOOP API after a webhook.

## Token handling

Use two tables:

1. `whoop_connections`
2. `whoop_sync_log`

Store tokens only where the browser cannot read them.

Minimum approach:

- RLS enabled.
- No client SELECT policy for token fields.
- Netlify Functions use `SUPABASE_SERVICE_ROLE_KEY` server-side.
- Never place service role key in frontend env vars.

Better later:

- Supabase Vault or encrypted token storage.
- Token rotation and disconnect flow.

## Environment variables

Add to Netlify:

```env
WHOOP_CLIENT_ID=
WHOOP_CLIENT_SECRET=
WHOOP_REDIRECT_URI=https://<your-netlify-site>/.netlify/functions/whoop-callback
SUPABASE_SERVICE_ROLE_KEY=
VITE_ENABLE_WHOOP=false
```

Keep existing frontend vars:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Required Netlify Functions

Create these only when WHOOP is implemented:

```txt
netlify/functions/whoop-start-auth.ts
netlify/functions/whoop-callback.ts
netlify/functions/whoop-sync.ts
netlify/functions/whoop-disconnect.ts
netlify/functions/whoop-webhook.ts
```

### whoop-start-auth

Purpose:

- Verify current Supabase user.
- Generate state value.
- Store state temporarily.
- Redirect user to WHOOP authorization URL.

### whoop-callback

Purpose:

- Validate state.
- Exchange authorization code for token.
- Store token server-side.
- Redirect back to ControlBase settings page.

### whoop-sync

Purpose:

- Refresh token if needed.
- Fetch WHOOP data.
- Upsert normalized rows into Supabase.
- Log success/failure.

### whoop-disconnect

Purpose:

- Delete stored tokens.
- Mark WHOOP connection inactive.
- Optionally keep or delete imported metric history depending on user choice.

### whoop-webhook

Purpose:

- Validate WHOOP webhook signature.
- Queue/fetch updated data.
- Return quickly.

## UI changes

### Settings > Integrationen > WHOOP

Fields/status:

- Verbindung: verbunden / nicht verbunden
- Letzte Synchronisierung
- Verbinden button
- Jetzt synchronisieren button
- Trennen button
- Data scope explanation in German

German copy:

```txt
ControlBase kann deine WHOOP-Daten importieren, um Schlaf, Recovery, Strain und Training besser in deine Tagesentscheidung einzubeziehen. Deine WHOOP-Verbindung ist privat und wird nur für dein persönliches Dashboard genutzt.
```

### Dashboard

Add optional WHOOP card only when connected.

```txt
Recovery: 72% — Grün
Schlaf: 86% Performance
HRV: 54 ms
RHR: 58 bpm
Empfehlung: Normales Training möglich, aber Alkohol heute vermeiden.
```

## Privacy and compliance notes

WHOOP data is health-related behavioral data. Treat it as sensitive.

Rules:

- Private by default.
- No analytics on WHOOP data.
- No public sharing.
- Clear disconnect/delete option.
- Do not use WHOOP data for medical claims.
- UI language must say: trend and self-management, not diagnosis.

## Implementation order

1. Add DB schema only.
2. Add placeholder UI: “WHOOP vorbereitet, noch nicht aktiv”.
3. Add OAuth functions.
4. Add manual sync.
5. Add dashboard cards.
6. Add scheduled sync.
7. Add webhooks only after manual sync works reliably.

## Non-goals

Do not build at first:

- Coaching recommendations beyond simple rule-based hints
- Medical interpretation
- AI diagnosis
- public leaderboard
- multi-user wellness product
- full Apple Health + WHOOP + Garmin aggregator

## Success criteria

WHOOP integration is successful when:

- User connects WHOOP securely.
- Last 14 days sync without manual token handling.
- Dashboard shows recovery, sleep and strain clearly.
- Manual daily check-in remains usable under 2 minutes.
- WHOOP data creates better decisions, not more complexity.
