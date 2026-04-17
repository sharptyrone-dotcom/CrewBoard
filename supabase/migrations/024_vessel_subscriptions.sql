-- Vessel subscriptions
--
-- Tracks the billing state of each vessel. A row is created automatically
-- when a new vessel is set up through the /signup flow — it starts in
-- `trialing` status with a 30-day `trial_ends_at`. When the trial expires,
-- the vessel either converts to `active` (after providing payment) or
-- `past_due` → `canceled`.
--
-- The `status` column is a text field with a check constraint rather than
-- a Postgres enum so we can add new billing states (e.g. `paused`,
-- `pending_cancel`) without writing an ALTER TYPE migration later.
--
-- RLS: any crew member on the vessel can read the subscription (so the
-- app can show the trial countdown / upgrade prompts). Only admins can
-- update it. Inserts are done exclusively by the server-side signup
-- route using the service role key, so no INSERT policy is defined for
-- regular users.

create table if not exists vessel_subscriptions (
  id              uuid primary key default gen_random_uuid(),
  vessel_id       uuid not null unique references vessels(id) on delete cascade,
  status          text not null default 'trialing'
                     check (status in ('trialing', 'active', 'past_due', 'canceled', 'paused')),
  trial_ends_at   timestamptz,
  current_period_end timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_vessel_subscriptions_vessel_id
  on vessel_subscriptions(vessel_id);

alter table vessel_subscriptions enable row level security;

create policy "Crew on vessel can read subscription"
  on vessel_subscriptions for select
  using (vessel_id = current_crew_vessel_id());

create policy "Admins on vessel can update subscription"
  on vessel_subscriptions for update
  using (vessel_id = current_crew_vessel_id() and is_current_crew_admin())
  with check (vessel_id = current_crew_vessel_id() and is_current_crew_admin());

-- Keep updated_at in sync on any change.
create or replace function touch_vessel_subscriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_vessel_subscriptions_updated_at on vessel_subscriptions;
create trigger trg_vessel_subscriptions_updated_at
  before update on vessel_subscriptions
  for each row execute function touch_vessel_subscriptions_updated_at();
