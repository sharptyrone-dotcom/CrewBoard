-- Push notification subscriptions for the Web Push API.
--
-- Each row stores a single push endpoint for a crew member. A crew
-- member can have multiple subscriptions if they use multiple devices
-- or browsers. The endpoint, p256dh, and auth columns come directly
-- from the browser PushSubscription object — see
-- https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription
--
-- The table is scoped to vessel_id so the API route can batch-query
-- all subscriptions for a vessel without a second join. ON DELETE
-- CASCADE on crew_members means we clean up automatically when a
-- crew member is removed.

create table if not exists push_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  crew_member_id uuid not null references crew_members(id) on delete cascade,
  vessel_id     uuid not null references vessels(id) on delete cascade,
  endpoint      text not null,
  p256dh        text not null,
  auth          text not null,
  created_at    timestamptz not null default now(),
  unique(crew_member_id, endpoint)
);

-- Index for the common query: "give me all subscriptions for these
-- crew member IDs on this vessel".
create index if not exists idx_push_subs_vessel
  on push_subscriptions(vessel_id);
create index if not exists idx_push_subs_crew
  on push_subscriptions(crew_member_id);

-- RLS: crew can manage their own subscriptions; reads are scoped to
-- the same vessel so the API route (using the service role key) can
-- query all subs at once.
alter table push_subscriptions enable row level security;

-- Crew can insert their own subscription.
create policy push_subs_insert_own on push_subscriptions
  for insert to authenticated
  with check (
    crew_member_id = auth.uid()
    and vessel_id = current_crew_vessel_id()
  );

-- Crew can delete their own subscriptions (e.g. unsubscribe).
create policy push_subs_delete_own on push_subscriptions
  for delete to authenticated
  using (crew_member_id = auth.uid());

-- Crew can read their own subscriptions.
create policy push_subs_select_own on push_subscriptions
  for select to authenticated
  using (crew_member_id = auth.uid());

-- Admins can read all subscriptions for their vessel (needed by the
-- send-reminder API route when using anon key — though in practice
-- the API route uses the service role key which bypasses RLS).
create policy push_subs_select_admin on push_subscriptions
  for select to authenticated
  using (
    is_current_crew_admin()
    and vessel_id = current_crew_vessel_id()
  );
