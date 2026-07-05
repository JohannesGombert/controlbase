alter table public.finance_transactions
drop constraint if exists finance_transactions_transaction_type_check;

alter table public.finance_transactions
add constraint finance_transactions_transaction_type_check
check (transaction_type in ('income', 'expense', 'transfer'));

alter table public.finance_transactions
add column if not exists import_hash text;

alter table public.finance_transactions
add column if not exists source text;

alter table public.finance_transactions
add column if not exists original_description text;

create unique index if not exists finance_transactions_user_import_hash_idx
on public.finance_transactions(user_id, import_hash)
where import_hash is not null;

notify pgrst, 'reload schema';
