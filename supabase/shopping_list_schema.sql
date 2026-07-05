-- ControlBase generated weekly shopping list
create table if not exists public.nutrition_shopping_items (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.nutrition_week_plans(id) on delete cascade,
  ingredient text not null, quantity numeric, unit text, category text not null default 'Sonstiges',
  checked boolean not null default false, created_at timestamptz not null default now(),
  unique(plan_id, ingredient, unit)
);
alter table public.nutrition_shopping_items enable row level security;
revoke all on public.nutrition_shopping_items from anon;
grant select,insert,update,delete on public.nutrition_shopping_items to authenticated;
drop policy if exists "nutrition_shopping_items_own" on public.nutrition_shopping_items;
create policy "nutrition_shopping_items_own" on public.nutrition_shopping_items for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
notify pgrst, 'reload schema';
