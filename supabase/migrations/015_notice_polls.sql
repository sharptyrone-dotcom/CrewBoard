-- ---------------------------------------------------------------------------
-- 015 — Poll support for Social notices
--
-- Adds an optional poll to any notice. poll_options is a JSONB array of
-- {id, text} objects stored on the notices row itself. Votes live in a
-- separate table with a one-vote-per-crew-member-per-notice constraint.
-- ---------------------------------------------------------------------------

-- 1. Add poll_options column to notices
alter table notices add column if not exists poll_options jsonb default null;

-- 2. Poll votes table
create table if not exists poll_votes (
  id              uuid primary key default gen_random_uuid(),
  notice_id       uuid not null references notices(id) on delete cascade,
  crew_member_id  uuid not null references crew_members(id) on delete cascade,
  option_id       text not null,
  created_at      timestamptz not null default now(),
  unique (notice_id, crew_member_id)
);

create index if not exists idx_poll_votes_notice on poll_votes(notice_id);

-- 3. RLS
alter table poll_votes enable row level security;

-- Everyone on the vessel can see poll results
create policy poll_votes_select on poll_votes for select using (
  exists (
    select 1 from notices n
      join crew_members cm on cm.vessel_id = n.vessel_id
    where n.id = poll_votes.notice_id
      and cm.id = auth.uid()
  )
);

-- Crew can cast / change / remove their own vote
create policy poll_votes_insert on poll_votes for insert
  with check (crew_member_id = auth.uid());
create policy poll_votes_update on poll_votes for update
  using (crew_member_id = auth.uid())
  with check (crew_member_id = auth.uid());
create policy poll_votes_delete on poll_votes for delete
  using (crew_member_id = auth.uid());

-- 4. Realtime
alter publication supabase_realtime add table poll_votes;
alter table poll_votes replica identity full;

-- 5. Dev anon policies (matches pattern from other tables)
create policy poll_votes_anon_select on poll_votes for select to anon using (true);
create policy poll_votes_anon_insert on poll_votes for insert to anon with check (true);
create policy poll_votes_anon_update on poll_votes for update to anon using (true) with check (true);
create policy poll_votes_anon_delete on poll_votes for delete to anon using (true);
