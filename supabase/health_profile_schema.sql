-- ControlBase health profile (step 1)
-- Run once in the Supabase SQL editor.

create table if not exists public.health_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  current_weight numeric check (current_weight between 30 and 350),
  target_weight numeric check (target_weight between 30 and 350),
  height_cm integer check (height_cm between 120 and 230),
  birth_date date,
  sex text check (sex in ('female', 'male', 'diverse', 'unspecified')),
  weekly_weight_loss numeric not null default 0.5 check (weekly_weight_loss between 0.1 and 1.0),
  activity_level text not null default 'moderate' check (activity_level in ('low', 'light', 'moderate', 'high', 'very_high')),
  diet_style text not null default 'balanced' check (diet_style in ('balanced', 'vegetarian', 'vegan', 'low_carb', 'mediterranean', 'other')),
  meals_per_day integer not null default 3 check (meals_per_day between 2 and 6),
  allergies text,
  dislikes text,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

drop trigger if exists set_health_profiles_updated_at on public.health_profiles;
create trigger set_health_profiles_updated_at before update on public.health_profiles for each row execute function public.set_updated_at();

alter table public.health_profiles enable row level security;
revoke all on table public.health_profiles from anon;
grant select, insert, update, delete on table public.health_profiles to authenticated;
drop policy if exists "health_profiles_own" on public.health_profiles;
create policy "health_profiles_own" on public.health_profiles for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
notify pgrst, 'reload schema';
