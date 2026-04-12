-- ---------------------------------------------------------------------------
-- 003 — Events System
--
-- Four tables: events (calendar entries with notification scheduling),
-- event_briefings (per-department briefing sections), event_updates
-- (timeline of updates posted by crew), and event_reads (read-receipt
-- tracking per crew member).
-- ---------------------------------------------------------------------------

-- ── Enums ────────────────────────────────────────────────────────────
create type event_type   as enum ('passage', 'guest_visit', 'maintenance', 'social', 'custom');
create type event_status as enum ('upcoming', 'active', 'completed', 'cancelled');

-- ── 1. Events ───────────────────────────────────────────────────────
create table events (
  id                    uuid primary key default gen_random_uuid(),
  vessel_id             uuid not null references vessels(id) on delete cascade,
  created_by            uuid not null references crew_members(id) on delete restrict,
  event_type            event_type not null default 'custom',
  title                 text not null,
  description           text not null default '',
  start_date            timestamptz not null,
  end_date              timestamptz,
  status                event_status not null default 'upcoming',
  attachments           jsonb not null default '[]'::jsonb,
  restricted_fields     jsonb,          -- fields only visible to specified roles
  notification_schedule jsonb not null default '[
    {"days_before": 7, "sent": false},
    {"days_before": 3, "sent": false},
    {"days_before": 1, "sent": false}
  ]'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_events_vessel     on events(vessel_id);
create index idx_events_start_date on events(start_date);
create index idx_events_status     on events(status);

-- ── 2. Event Briefings ──────────────────────────────────────────────
create table event_briefings (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id) on delete cascade,
  department  text not null,
  content     text not null default '',
  attachments jsonb not null default '[]'::jsonb,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_event_briefings_event on event_briefings(event_id);

-- ── 3. Event Updates ────────────────────────────────────────────────
create table event_updates (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  created_by uuid not null references crew_members(id) on delete restrict,
  content    text not null,
  created_at timestamptz not null default now()
);

create index idx_event_updates_event on event_updates(event_id);

-- ── 4. Event Reads ──────────────────────────────────────────────────
create table event_reads (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references events(id) on delete cascade,
  crew_member_id uuid not null references crew_members(id) on delete cascade,
  read_at        timestamptz not null default now(),
  unique (event_id, crew_member_id)
);

create index idx_event_reads_event on event_reads(event_id);

-- ── RLS ─────────────────────────────────────────────────────────────
alter table events          enable row level security;
alter table event_briefings enable row level security;
alter table event_updates   enable row level security;
alter table event_reads     enable row level security;

-- events: vessel crew can read, admins can write
create policy events_select on events
  for select using (vessel_id = current_crew_vessel_id());

create policy events_insert on events
  for insert with check (vessel_id = current_crew_vessel_id());

create policy events_update on events
  for update using  (vessel_id = current_crew_vessel_id())
         with check (vessel_id = current_crew_vessel_id());

create policy events_delete on events
  for delete using (vessel_id = current_crew_vessel_id());

-- event_briefings: readable by vessel crew (via events join), writable by vessel crew
create policy event_briefings_select on event_briefings
  for select using (
    exists (
      select 1 from events e
      where e.id = event_briefings.event_id
        and e.vessel_id = current_crew_vessel_id()
    )
  );

create policy event_briefings_insert on event_briefings
  for insert with check (
    exists (
      select 1 from events e
      where e.id = event_briefings.event_id
        and e.vessel_id = current_crew_vessel_id()
    )
  );

create policy event_briefings_update on event_briefings
  for update using (
    exists (
      select 1 from events e
      where e.id = event_briefings.event_id
        and e.vessel_id = current_crew_vessel_id()
    )
  );

create policy event_briefings_delete on event_briefings
  for delete using (
    exists (
      select 1 from events e
      where e.id = event_briefings.event_id
        and e.vessel_id = current_crew_vessel_id()
    )
  );

-- event_updates: readable by vessel crew (via events join), insertable by vessel crew
create policy event_updates_select on event_updates
  for select using (
    exists (
      select 1 from events e
      where e.id = event_updates.event_id
        and e.vessel_id = current_crew_vessel_id()
    )
  );

create policy event_updates_insert on event_updates
  for insert with check (
    created_by = auth.uid()
    and exists (
      select 1 from events e
      where e.id = event_updates.event_id
        and e.vessel_id = current_crew_vessel_id()
    )
  );

create policy event_updates_delete on event_updates
  for delete using (
    exists (
      select 1 from events e
      where e.id = event_updates.event_id
        and e.vessel_id = current_crew_vessel_id()
    )
  );

-- event_reads: crew can read own vessel's, insert own
create policy event_reads_select on event_reads
  for select using (
    exists (
      select 1 from events e
      where e.id = event_reads.event_id
        and e.vessel_id = current_crew_vessel_id()
    )
  );

create policy event_reads_insert on event_reads
  for insert with check (
    crew_member_id = auth.uid()
    and exists (
      select 1 from events e
      where e.id = event_reads.event_id
        and e.vessel_id = current_crew_vessel_id()
    )
  );

-- ── Realtime ────────────────────────────────────────────────────────
alter publication supabase_realtime add table events;
alter table events replica identity full;

-- ── Dev anon policies ───────────────────────────────────────────────
create policy events_anon_select on events for select to anon using (true);
create policy events_anon_insert on events for insert to anon with check (true);
create policy events_anon_update on events for update to anon using (true) with check (true);
create policy events_anon_delete on events for delete to anon using (true);

create policy event_briefings_anon_select on event_briefings for select to anon using (true);
create policy event_briefings_anon_insert on event_briefings for insert to anon with check (true);
create policy event_briefings_anon_update on event_briefings for update to anon using (true) with check (true);
create policy event_briefings_anon_delete on event_briefings for delete to anon using (true);

create policy event_updates_anon_select on event_updates for select to anon using (true);
create policy event_updates_anon_insert on event_updates for insert to anon with check (true);
create policy event_updates_anon_update on event_updates for update to anon using (true) with check (true);
create policy event_updates_anon_delete on event_updates for delete to anon using (true);

create policy event_reads_anon_select on event_reads for select to anon using (true);
create policy event_reads_anon_insert on event_reads for insert to anon with check (true);
create policy event_reads_anon_update on event_reads for update to anon using (true) with check (true);
create policy event_reads_anon_delete on event_reads for delete to anon using (true);
