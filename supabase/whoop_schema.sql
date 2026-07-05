-- WHOOP integration schema for ControlBase
-- Optional extension. Run after base schema if WHOOP integration is implemented.

create table if not exists whoop_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  whoop_user_id bigint,
  access_token text,
  refresh_token text,
  token_type text,
  scope text,
  expires_at timestamptz,
  connected_at timestamptz default now(),
  last_sync_at timestamptz,
  status text default 'connected',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists whoop_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  cycle_id text,
  sleep_id text,
  recovery_score numeric,
  hrv_rmssd_milli numeric,
  resting_heart_rate numeric,
  spo2_percentage numeric,
  skin_temp_celsius numeric,
  sleep_performance_percentage numeric,
  sleep_consistency_percentage numeric,
  sleep_efficiency_percentage numeric,
  respiratory_rate numeric,
  total_in_bed_minutes numeric,
  total_awake_minutes numeric,
  total_light_sleep_minutes numeric,
  total_slow_wave_sleep_minutes numeric,
  total_rem_sleep_minutes numeric,
  sleep_disturbance_count integer,
  day_strain numeric,
  cycle_average_heart_rate numeric,
  cycle_max_heart_rate numeric,
  cycle_kilojoule numeric,
  score_state text,
  whoop_updated_at timestamptz,
  raw_recovery jsonb,
  raw_sleep jsonb,
  raw_cycle jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

create table if not exists whoop_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  whoop_workout_id text not null,
  start_time timestamptz,
  end_time timestamptz,
  sport_id integer,
  strain numeric,
  average_heart_rate numeric,
  max_heart_rate numeric,
  kilojoule numeric,
  distance_meter numeric,
  altitude_gain_meter numeric,
  zone_zero_minutes numeric,
  zone_one_minutes numeric,
  zone_two_minutes numeric,
  zone_three_minutes numeric,
  zone_four_minutes numeric,
  zone_five_minutes numeric,
  score_state text,
  whoop_updated_at timestamptz,
  raw_workout jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, whoop_workout_id)
);

create table if not exists whoop_sync_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  sync_type text not null,
  status text not null,
  started_at timestamptz default now(),
  finished_at timestamptz,
  records_upserted integer default 0,
  error_message text,
  details jsonb
);

alter table whoop_connections enable row level security;
alter table whoop_daily_metrics enable row level security;
alter table whoop_workouts enable row level security;
alter table whoop_sync_log enable row level security;

revoke all on table whoop_connections from anon, authenticated;
revoke all on table whoop_daily_metrics from anon;
revoke all on table whoop_workouts from anon;
revoke all on table whoop_sync_log from anon;
grant select on table whoop_daily_metrics to authenticated;
grant select on table whoop_workouts to authenticated;
grant select on table whoop_sync_log to authenticated;

-- Client may only see non-token connection status through a view.
-- Do not grant browser-level SELECT on whoop_connections directly.

create or replace view whoop_connection_status as
select
  user_id,
  whoop_user_id,
  connected_at,
  last_sync_at,
  status,
  scope,
  expires_at
from whoop_connections;

-- Metrics are readable by the owning authenticated user.
drop policy if exists "Users can read own whoop daily metrics" on whoop_daily_metrics;
create policy "Users can read own whoop daily metrics"
  on whoop_daily_metrics for select
  using (auth.uid() = user_id);

drop policy if exists "Users can read own whoop workouts" on whoop_workouts;
create policy "Users can read own whoop workouts"
  on whoop_workouts for select
  using (auth.uid() = user_id);

drop policy if exists "Users can read own whoop sync log" on whoop_sync_log;
create policy "Users can read own whoop sync log"
  on whoop_sync_log for select
  using (auth.uid() = user_id);

-- Inserts/updates/deletes for WHOOP tables should be performed by server-side functions
-- using SUPABASE_SERVICE_ROLE_KEY, not by browser clients.
