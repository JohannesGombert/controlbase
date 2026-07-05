-- ControlBase weight progress (step 2)
create table if not exists public.health_weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_on date not null default current_date,
  weight numeric not null check (weight between 30 and 350),
  notes text,
  created_at timestamp with time zone not null default now(),
  unique(user_id, measured_on)
);
create index if not exists health_weight_entries_user_date_idx on public.health_weight_entries(user_id, measured_on desc);
alter table public.health_weight_entries enable row level security;
revoke all on table public.health_weight_entries from anon;
grant select, insert, update, delete on table public.health_weight_entries to authenticated;
drop policy if exists "health_weight_entries_own" on public.health_weight_entries;
create policy "health_weight_entries_own" on public.health_weight_entries for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
notify pgrst, 'reload schema';
