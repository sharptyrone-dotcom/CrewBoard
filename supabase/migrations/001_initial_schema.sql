-- CrewNotice initial schema
-- Creates all core tables, enums, indexes, and Row Level Security policies.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type department_enum as enum ('Bridge', 'Deck', 'Engine', 'Interior', 'Safety', 'General');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notice_category_enum as enum ('Safety', 'Operations', 'Guest Info', 'HR/Admin', 'Social', 'Departmental');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notice_priority_enum as enum ('critical', 'important', 'routine');
exception when duplicate_object then null; end $$;

do $$ begin
  create type document_type_enum as enum ('SOPs', 'Risk Assessments', 'Manuals', 'MSDS/COSHH', 'Checklists', 'Policies');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type_enum as enum ('notice', 'document', 'reminder', 'system');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- vessels
-- ---------------------------------------------------------------------------
create table if not exists vessels (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  imo_number    text,
  flag_state    text,
  vessel_type   text,
  max_crew      integer,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- crew_members
-- ---------------------------------------------------------------------------
create table if not exists crew_members (
  id               uuid primary key default gen_random_uuid(),
  vessel_id        uuid not null references vessels(id) on delete cascade,
  email            text not null unique,
  full_name        text not null,
  role             text,
  department       department_enum not null default 'General',
  is_admin         boolean not null default false,
  is_hod           boolean not null default false,
  avatar_initials  text,
  is_active        boolean not null default true,
  last_seen_at     timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists idx_crew_members_vessel_id on crew_members(vessel_id);

-- ---------------------------------------------------------------------------
-- notices
-- ---------------------------------------------------------------------------
create table if not exists notices (
  id                         uuid primary key default gen_random_uuid(),
  vessel_id                  uuid not null references vessels(id) on delete cascade,
  created_by                 uuid not null references crew_members(id) on delete restrict,
  title                      text not null,
  body                       text not null,
  category                   notice_category_enum not null,
  priority                   notice_priority_enum not null default 'routine',
  department_target          text not null default 'All',
  is_pinned                  boolean not null default false,
  requires_acknowledgement   boolean not null default false,
  expires_at                 timestamptz,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

create index if not exists idx_notices_vessel_id on notices(vessel_id);
create index if not exists idx_notices_created_at on notices(created_at desc);

-- ---------------------------------------------------------------------------
-- notice_reads
-- ---------------------------------------------------------------------------
create table if not exists notice_reads (
  id               uuid primary key default gen_random_uuid(),
  notice_id        uuid not null references notices(id) on delete cascade,
  crew_member_id   uuid not null references crew_members(id) on delete cascade,
  read_at          timestamptz not null default now(),
  acknowledged_at  timestamptz,
  unique (notice_id, crew_member_id)
);

create index if not exists idx_notice_reads_notice_id on notice_reads(notice_id);
create index if not exists idx_notice_reads_crew_member_id on notice_reads(crew_member_id);

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------
create table if not exists documents (
  id                    uuid primary key default gen_random_uuid(),
  vessel_id             uuid not null references vessels(id) on delete cascade,
  uploaded_by           uuid not null references crew_members(id) on delete restrict,
  title                 text not null,
  doc_type              document_type_enum not null,
  department            text,
  version               text,
  file_url              text not null,
  file_size_bytes       integer,
  page_count            integer,
  is_required           boolean not null default false,
  review_date           date,
  version_notes         text,
  previous_version_id   uuid references documents(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_documents_vessel_id on documents(vessel_id);

-- ---------------------------------------------------------------------------
-- document_acknowledgements
-- ---------------------------------------------------------------------------
create table if not exists document_acknowledgements (
  id                          uuid primary key default gen_random_uuid(),
  document_id                 uuid not null references documents(id) on delete cascade,
  crew_member_id              uuid not null references crew_members(id) on delete cascade,
  acknowledged_at             timestamptz not null default now(),
  version_at_acknowledgement  text,
  unique (document_id, crew_member_id)
);

create index if not exists idx_doc_acks_document_id on document_acknowledgements(document_id);
create index if not exists idx_doc_acks_crew_member_id on document_acknowledgements(crew_member_id);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
create table if not exists notifications (
  id               uuid primary key default gen_random_uuid(),
  vessel_id        uuid not null references vessels(id) on delete cascade,
  target_crew_id   uuid references crew_members(id) on delete cascade,
  type             notification_type_enum not null,
  title            text not null,
  body             text,
  reference_type   text,
  reference_id     uuid,
  is_read          boolean not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists idx_notifications_vessel_id on notifications(vessel_id);
create index if not exists idx_notifications_created_at on notifications(created_at desc);
create index if not exists idx_notifications_target_crew_id on notifications(target_crew_id);

-- ---------------------------------------------------------------------------
-- activity_log
-- ---------------------------------------------------------------------------
create table if not exists activity_log (
  id               uuid primary key default gen_random_uuid(),
  vessel_id        uuid not null references vessels(id) on delete cascade,
  crew_member_id   uuid not null references crew_members(id) on delete cascade,
  action           text not null,
  target_type      text,
  target_id        uuid,
  metadata         jsonb,
  created_at       timestamptz not null default now()
);

create index if not exists idx_activity_log_vessel_id on activity_log(vessel_id);
create index if not exists idx_activity_log_crew_member_id on activity_log(crew_member_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- Strategy: every crew member authenticates via Supabase Auth. Their auth uid
-- matches crew_members.id (populated out-of-band on signup). A SECURITY DEFINER
-- helper returns the vessel_id for the current user so policies stay simple
-- and avoid recursive lookups against crew_members inside its own policy.

create or replace function current_crew_vessel_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select vessel_id from crew_members where id = auth.uid() limit 1;
$$;

alter table vessels                    enable row level security;
alter table crew_members               enable row level security;
alter table notices                    enable row level security;
alter table notice_reads               enable row level security;
alter table documents                  enable row level security;
alter table document_acknowledgements  enable row level security;
alter table notifications              enable row level security;
alter table activity_log               enable row level security;

-- vessels: crew can see only their own vessel row
drop policy if exists vessels_select_own on vessels;
create policy vessels_select_own on vessels
  for select using (id = current_crew_vessel_id());

-- crew_members: visible to crewmates on the same vessel
drop policy if exists crew_members_select_same_vessel on crew_members;
create policy crew_members_select_same_vessel on crew_members
  for select using (vessel_id = current_crew_vessel_id());

drop policy if exists crew_members_update_self on crew_members;
create policy crew_members_update_self on crew_members
  for update using (id = auth.uid()) with check (id = auth.uid());

-- notices
drop policy if exists notices_select_same_vessel on notices;
create policy notices_select_same_vessel on notices
  for select using (vessel_id = current_crew_vessel_id());

drop policy if exists notices_insert_same_vessel on notices;
create policy notices_insert_same_vessel on notices
  for insert with check (vessel_id = current_crew_vessel_id());

drop policy if exists notices_update_same_vessel on notices;
create policy notices_update_same_vessel on notices
  for update using (vessel_id = current_crew_vessel_id())
          with check (vessel_id = current_crew_vessel_id());

drop policy if exists notices_delete_same_vessel on notices;
create policy notices_delete_same_vessel on notices
  for delete using (vessel_id = current_crew_vessel_id());

-- notice_reads: only rows belonging to crew on the same vessel (via notice)
drop policy if exists notice_reads_select_same_vessel on notice_reads;
create policy notice_reads_select_same_vessel on notice_reads
  for select using (
    exists (
      select 1 from notices n
      where n.id = notice_reads.notice_id
        and n.vessel_id = current_crew_vessel_id()
    )
  );

drop policy if exists notice_reads_insert_self on notice_reads;
create policy notice_reads_insert_self on notice_reads
  for insert with check (
    crew_member_id = auth.uid()
    and exists (
      select 1 from notices n
      where n.id = notice_reads.notice_id
        and n.vessel_id = current_crew_vessel_id()
    )
  );

drop policy if exists notice_reads_update_self on notice_reads;
create policy notice_reads_update_self on notice_reads
  for update using (crew_member_id = auth.uid())
          with check (crew_member_id = auth.uid());

-- documents
drop policy if exists documents_select_same_vessel on documents;
create policy documents_select_same_vessel on documents
  for select using (vessel_id = current_crew_vessel_id());

drop policy if exists documents_insert_same_vessel on documents;
create policy documents_insert_same_vessel on documents
  for insert with check (vessel_id = current_crew_vessel_id());

drop policy if exists documents_update_same_vessel on documents;
create policy documents_update_same_vessel on documents
  for update using (vessel_id = current_crew_vessel_id())
          with check (vessel_id = current_crew_vessel_id());

drop policy if exists documents_delete_same_vessel on documents;
create policy documents_delete_same_vessel on documents
  for delete using (vessel_id = current_crew_vessel_id());

-- document_acknowledgements
drop policy if exists doc_acks_select_same_vessel on document_acknowledgements;
create policy doc_acks_select_same_vessel on document_acknowledgements
  for select using (
    exists (
      select 1 from documents d
      where d.id = document_acknowledgements.document_id
        and d.vessel_id = current_crew_vessel_id()
    )
  );

drop policy if exists doc_acks_insert_self on document_acknowledgements;
create policy doc_acks_insert_self on document_acknowledgements
  for insert with check (
    crew_member_id = auth.uid()
    and exists (
      select 1 from documents d
      where d.id = document_acknowledgements.document_id
        and d.vessel_id = current_crew_vessel_id()
    )
  );

-- notifications
drop policy if exists notifications_select_same_vessel on notifications;
create policy notifications_select_same_vessel on notifications
  for select using (
    vessel_id = current_crew_vessel_id()
    and (target_crew_id is null or target_crew_id = auth.uid())
  );

drop policy if exists notifications_update_self on notifications;
create policy notifications_update_self on notifications
  for update using (
    vessel_id = current_crew_vessel_id()
    and (target_crew_id is null or target_crew_id = auth.uid())
  ) with check (
    vessel_id = current_crew_vessel_id()
  );

drop policy if exists notifications_insert_same_vessel on notifications;
create policy notifications_insert_same_vessel on notifications
  for insert with check (vessel_id = current_crew_vessel_id());

-- activity_log
drop policy if exists activity_log_select_same_vessel on activity_log;
create policy activity_log_select_same_vessel on activity_log
  for select using (vessel_id = current_crew_vessel_id());

drop policy if exists activity_log_insert_same_vessel on activity_log;
create policy activity_log_insert_same_vessel on activity_log
  for insert with check (
    vessel_id = current_crew_vessel_id()
    and crew_member_id = auth.uid()
  );
