-- ControlBase finance module
-- Run once in the Supabase SQL editor after the base schema.

create extension if not exists "pgcrypto";

create table if not exists public.finance_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  account_type text not null check (account_type in ('bank', 'cash', 'credit_card', 'investment', 'debt', 'other')),
  balance numeric not null default 0,
  currency text not null default 'CHF' check (char_length(currency) = 3),
  included_in_net_worth boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.finance_accounts(id) on delete set null,
  transaction_date date not null default current_date,
  transaction_type text not null check (transaction_type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  category text not null,
  description text not null,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.finance_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  category text not null,
  limit_amount numeric not null check (limit_amount > 0),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique(user_id, month, category)
);

create index if not exists finance_transactions_user_date_idx on public.finance_transactions(user_id, transaction_date desc);
create index if not exists finance_accounts_user_idx on public.finance_accounts(user_id);
create index if not exists finance_budgets_user_month_idx on public.finance_budgets(user_id, month);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_finance_accounts_updated_at on public.finance_accounts;
create trigger set_finance_accounts_updated_at before update on public.finance_accounts for each row execute function public.set_updated_at();
drop trigger if exists set_finance_transactions_updated_at on public.finance_transactions;
create trigger set_finance_transactions_updated_at before update on public.finance_transactions for each row execute function public.set_updated_at();
drop trigger if exists set_finance_budgets_updated_at on public.finance_budgets;
create trigger set_finance_budgets_updated_at before update on public.finance_budgets for each row execute function public.set_updated_at();

alter table public.finance_accounts enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.finance_budgets enable row level security;

revoke all on table public.finance_accounts from anon;
revoke all on table public.finance_transactions from anon;
revoke all on table public.finance_budgets from anon;
grant select, insert, update, delete on table public.finance_accounts to authenticated;
grant select, insert, update, delete on table public.finance_transactions to authenticated;
grant select, insert, update, delete on table public.finance_budgets to authenticated;

drop policy if exists "finance_accounts_own" on public.finance_accounts;
create policy "finance_accounts_own" on public.finance_accounts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "finance_transactions_own" on public.finance_transactions;
create policy "finance_transactions_own" on public.finance_transactions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "finance_budgets_own" on public.finance_budgets;
create policy "finance_budgets_own" on public.finance_budgets for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
