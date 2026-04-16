-- ---------------------------------------------------------------------------
-- 020 · Custom Taxonomies
--
-- Adds three tables so admins can extend the built-in department, document
-- type, and notice category lists on a per-vessel basis.
-- ---------------------------------------------------------------------------

-- ── custom_departments ─────────────────────────────────────────────────────
create table if not exists custom_departments (
  id          uuid primary key default gen_random_uuid(),
  vessel_id   uuid not null references vessels(id) on delete cascade,
  label       text not null,
  created_by  uuid references crew_members(id) on delete set null,
  created_at  timestamptz not null default now(),
  constraint uq_custom_dept_vessel_label unique (vessel_id, label)
);

alter table custom_departments enable row level security;

create policy "Crew on same vessel can read custom departments"
  on custom_departments for select
  using (vessel_id = current_crew_vessel_id());

create policy "Admins can insert custom departments"
  on custom_departments for insert
  with check (vessel_id = current_crew_vessel_id() and is_current_crew_admin());

create policy "Admins can update custom departments"
  on custom_departments for update
  using (vessel_id = current_crew_vessel_id() and is_current_crew_admin());

create policy "Admins can delete custom departments"
  on custom_departments for delete
  using (vessel_id = current_crew_vessel_id() and is_current_crew_admin());

-- ── custom_document_types ──────────────────────────────────────────────────
create table if not exists custom_document_types (
  id          uuid primary key default gen_random_uuid(),
  vessel_id   uuid not null references vessels(id) on delete cascade,
  label       text not null,
  created_by  uuid references crew_members(id) on delete set null,
  created_at  timestamptz not null default now(),
  constraint uq_custom_doc_type_vessel_label unique (vessel_id, label)
);

alter table custom_document_types enable row level security;

create policy "Crew on same vessel can read custom document types"
  on custom_document_types for select
  using (vessel_id = current_crew_vessel_id());

create policy "Admins can insert custom document types"
  on custom_document_types for insert
  with check (vessel_id = current_crew_vessel_id() and is_current_crew_admin());

create policy "Admins can update custom document types"
  on custom_document_types for update
  using (vessel_id = current_crew_vessel_id() and is_current_crew_admin());

create policy "Admins can delete custom document types"
  on custom_document_types for delete
  using (vessel_id = current_crew_vessel_id() and is_current_crew_admin());

-- ── custom_notice_categories ───────────────────────────────────────────────
create table if not exists custom_notice_categories (
  id          uuid primary key default gen_random_uuid(),
  vessel_id   uuid not null references vessels(id) on delete cascade,
  label       text not null,
  color       text not null default '#64748b',
  created_by  uuid references crew_members(id) on delete set null,
  created_at  timestamptz not null default now(),
  constraint uq_custom_notice_cat_vessel_label unique (vessel_id, label)
);

alter table custom_notice_categories enable row level security;

create policy "Crew on same vessel can read custom notice categories"
  on custom_notice_categories for select
  using (vessel_id = current_crew_vessel_id());

create policy "Admins can insert custom notice categories"
  on custom_notice_categories for insert
  with check (vessel_id = current_crew_vessel_id() and is_current_crew_admin());

create policy "Admins can update custom notice categories"
  on custom_notice_categories for update
  using (vessel_id = current_crew_vessel_id() and is_current_crew_admin());

create policy "Admins can delete custom notice categories"
  on custom_notice_categories for delete
  using (vessel_id = current_crew_vessel_id() and is_current_crew_admin());
