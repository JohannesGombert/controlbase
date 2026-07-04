-- ControlBase MVP schema
-- Run this in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight numeric,
  sleep_quality text check (sleep_quality in ('schlecht', 'okay', 'gut') or sleep_quality is null),
  steps integer check (steps >= 0 or steps is null),
  training_type text,
  alcohol boolean default false,
  cigarettes integer check (cigarettes >= 0 or cigarettes is null),
  first_cigarette_time time,
  food_quality text check (food_quality in ('sauber', 'mittel', 'schlecht') or food_quality is null),
  expenses_over_50 numeric check (expenses_over_50 >= 0 or expenses_over_50 is null),
  top3_status text check (top3_status in ('ja', 'teilweise', 'nein') or top3_status is null),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, date)
);

create table if not exists public.daily_top3 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  business_task text,
  health_task text,
  private_task text,
  business_done boolean default false,
  health_done boolean default false,
  private_done boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, date)
);

create table if not exists public.purchase_waitlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_name text not null,
  price numeric check (price >= 0 or price is null),
  category text,
  reason text,
  created_date date default current_date,
  earliest_decision_date date generated always as (created_date + 7) stored,
  status text not null default 'waiting' check (status in ('waiting', 'allowed', 'bought', 'rejected', 'postponed')),
  decision text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.idea_parking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idea text not null,
  category text,
  importance integer check (importance between 1 and 5 or importance is null),
  effort integer check (effort between 1 and 5 or effort is null),
  benefit integer check (benefit between 1 and 5 or benefit is null),
  status text not null default 'parked' check (status in ('parked', 'review', 'start', 'delete')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  week_end date not null,
  what_went_well text,
  what_distracted_me text,
  what_to_stop text,
  next_week_goal_1 text,
  next_week_goal_2 text,
  next_week_goal_3 text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, week_start)
);

create table if not exists public.ceo_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  block_type text,
  planned_start time,
  planned_end time,
  completed boolean default false,
  topic text,
  outcome text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_daily_checkins_updated_at on public.daily_checkins;
create trigger set_daily_checkins_updated_at
before update on public.daily_checkins
for each row execute function public.set_updated_at();

drop trigger if exists set_daily_top3_updated_at on public.daily_top3;
create trigger set_daily_top3_updated_at
before update on public.daily_top3
for each row execute function public.set_updated_at();

drop trigger if exists set_purchase_waitlist_updated_at on public.purchase_waitlist;
create trigger set_purchase_waitlist_updated_at
before update on public.purchase_waitlist
for each row execute function public.set_updated_at();

drop trigger if exists set_idea_parking_updated_at on public.idea_parking;
create trigger set_idea_parking_updated_at
before update on public.idea_parking
for each row execute function public.set_updated_at();

drop trigger if exists set_weekly_reviews_updated_at on public.weekly_reviews;
create trigger set_weekly_reviews_updated_at
before update on public.weekly_reviews
for each row execute function public.set_updated_at();

drop trigger if exists set_ceo_blocks_updated_at on public.ceo_blocks;
create trigger set_ceo_blocks_updated_at
before update on public.ceo_blocks
for each row execute function public.set_updated_at();
