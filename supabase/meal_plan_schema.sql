-- ControlBase weekly meal planning (step 3)
create table if not exists public.nutrition_week_plans (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null, calorie_target integer not null, protein_target integer not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id, week_start)
);
create table if not exists public.nutrition_meals (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.nutrition_week_plans(id) on delete cascade,
  meal_date date not null, meal_type text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  title text not null, calories integer, protein integer, ingredients text[] not null default '{}', notes text,
  eaten_at timestamptz,
  photo_data_url text,
  photo_calorie_estimate integer,
  photo_protein_estimate integer,
  photo_analysis_note text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(plan_id, meal_date, meal_type)
);
alter table public.nutrition_meals add column if not exists eaten_at timestamptz;
alter table public.nutrition_meals add column if not exists photo_data_url text;
alter table public.nutrition_meals add column if not exists photo_calorie_estimate integer;
alter table public.nutrition_meals add column if not exists photo_protein_estimate integer;
alter table public.nutrition_meals add column if not exists photo_analysis_note text;
drop trigger if exists set_nutrition_week_plans_updated_at on public.nutrition_week_plans;
create trigger set_nutrition_week_plans_updated_at before update on public.nutrition_week_plans for each row execute function public.set_updated_at();
drop trigger if exists set_nutrition_meals_updated_at on public.nutrition_meals;
create trigger set_nutrition_meals_updated_at before update on public.nutrition_meals for each row execute function public.set_updated_at();
alter table public.nutrition_week_plans enable row level security;
alter table public.nutrition_meals enable row level security;
revoke all on public.nutrition_week_plans, public.nutrition_meals from anon;
grant select,insert,update,delete on public.nutrition_week_plans, public.nutrition_meals to authenticated;
drop policy if exists "nutrition_week_plans_own" on public.nutrition_week_plans;
create policy "nutrition_week_plans_own" on public.nutrition_week_plans for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "nutrition_meals_own" on public.nutrition_meals;
create policy "nutrition_meals_own" on public.nutrition_meals for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
notify pgrst, 'reload schema';
