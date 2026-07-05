-- ControlBase MVP Row Level Security policies
-- Run this after schema.sql in Supabase SQL editor.

alter table public.daily_checkins enable row level security;
alter table public.daily_top3 enable row level security;
alter table public.purchase_waitlist enable row level security;
alter table public.idea_parking enable row level security;
alter table public.weekly_reviews enable row level security;
alter table public.ceo_blocks enable row level security;

-- The project uses opt-in Data API grants. Anonymous visitors get no table
-- access; authenticated users receive only the CRUD privileges guarded by RLS.
revoke all on table public.daily_checkins from anon;
revoke all on table public.daily_top3 from anon;
revoke all on table public.purchase_waitlist from anon;
revoke all on table public.idea_parking from anon;
revoke all on table public.weekly_reviews from anon;
revoke all on table public.ceo_blocks from anon;

grant select, insert, update, delete on table public.daily_checkins to authenticated;
grant select, insert, update, delete on table public.daily_top3 to authenticated;
grant select, insert, update, delete on table public.purchase_waitlist to authenticated;
grant select, insert, update, delete on table public.idea_parking to authenticated;
grant select, insert, update, delete on table public.weekly_reviews to authenticated;
grant select, insert, update, delete on table public.ceo_blocks to authenticated;

-- daily_checkins
create policy "daily_checkins_select_own"
on public.daily_checkins for select
to authenticated
using (auth.uid() = user_id);

create policy "daily_checkins_insert_own"
on public.daily_checkins for insert
to authenticated
with check (auth.uid() = user_id);

create policy "daily_checkins_update_own"
on public.daily_checkins for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "daily_checkins_delete_own"
on public.daily_checkins for delete
to authenticated
using (auth.uid() = user_id);

-- daily_top3
create policy "daily_top3_select_own"
on public.daily_top3 for select
to authenticated
using (auth.uid() = user_id);

create policy "daily_top3_insert_own"
on public.daily_top3 for insert
to authenticated
with check (auth.uid() = user_id);

create policy "daily_top3_update_own"
on public.daily_top3 for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "daily_top3_delete_own"
on public.daily_top3 for delete
to authenticated
using (auth.uid() = user_id);

-- purchase_waitlist
create policy "purchase_waitlist_select_own"
on public.purchase_waitlist for select
to authenticated
using (auth.uid() = user_id);

create policy "purchase_waitlist_insert_own"
on public.purchase_waitlist for insert
to authenticated
with check (auth.uid() = user_id);

create policy "purchase_waitlist_update_own"
on public.purchase_waitlist for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "purchase_waitlist_delete_own"
on public.purchase_waitlist for delete
to authenticated
using (auth.uid() = user_id);

-- idea_parking
create policy "idea_parking_select_own"
on public.idea_parking for select
to authenticated
using (auth.uid() = user_id);

create policy "idea_parking_insert_own"
on public.idea_parking for insert
to authenticated
with check (auth.uid() = user_id);

create policy "idea_parking_update_own"
on public.idea_parking for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "idea_parking_delete_own"
on public.idea_parking for delete
to authenticated
using (auth.uid() = user_id);

-- weekly_reviews
create policy "weekly_reviews_select_own"
on public.weekly_reviews for select
to authenticated
using (auth.uid() = user_id);

create policy "weekly_reviews_insert_own"
on public.weekly_reviews for insert
to authenticated
with check (auth.uid() = user_id);

create policy "weekly_reviews_update_own"
on public.weekly_reviews for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "weekly_reviews_delete_own"
on public.weekly_reviews for delete
to authenticated
using (auth.uid() = user_id);

-- ceo_blocks
create policy "ceo_blocks_select_own"
on public.ceo_blocks for select
to authenticated
using (auth.uid() = user_id);

create policy "ceo_blocks_insert_own"
on public.ceo_blocks for insert
to authenticated
with check (auth.uid() = user_id);

create policy "ceo_blocks_update_own"
on public.ceo_blocks for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "ceo_blocks_delete_own"
on public.ceo_blocks for delete
to authenticated
using (auth.uid() = user_id);
