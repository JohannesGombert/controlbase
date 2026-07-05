create table if not exists public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category_type text not null check (category_type in ('expense', 'income', 'transfer')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique(user_id, name)
);

create index if not exists finance_categories_user_type_idx
on public.finance_categories(user_id, category_type, name);

drop trigger if exists set_finance_categories_updated_at on public.finance_categories;
create trigger set_finance_categories_updated_at
before update on public.finance_categories
for each row execute function public.set_updated_at();

alter table public.finance_categories enable row level security;

revoke all on table public.finance_categories from anon;
grant select, insert, update, delete on table public.finance_categories to authenticated;

drop policy if exists "finance_categories_own" on public.finance_categories;
create policy "finance_categories_own"
on public.finance_categories
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
