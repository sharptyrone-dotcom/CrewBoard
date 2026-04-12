-- ---------------------------------------------------------------------------
-- 016 — Training & Quiz System
--
-- Four tables: training_modules (course content + settings), quiz_questions
-- (per-module question bank), training_assignments (crew ↔ module join with
-- status tracking), and quiz_attempts (scored quiz submissions).
-- ---------------------------------------------------------------------------

-- ── Enums ────────────────────────────────────────────────────────────
create type quiz_question_type as enum ('multiple_choice', 'true_false', 'scenario');
create type training_status    as enum ('assigned', 'in_progress', 'completed', 'overdue');

-- ── 1. Training Modules ─────────────────────────────────────────────
create table training_modules (
  id                   uuid primary key default gen_random_uuid(),
  vessel_id            uuid not null references vessels(id) on delete cascade,
  created_by           uuid not null references crew_members(id) on delete restrict,
  title                text not null,
  description          text not null default '',
  content              jsonb not null default '[]'::jsonb,
  attachments          jsonb not null default '[]'::jsonb,
  pass_mark            int not null default 80,
  time_limit_minutes   int,
  randomise_questions  boolean not null default false,
  is_published         boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index idx_training_modules_vessel on training_modules(vessel_id);

-- ── 2. Quiz Questions ───────────────────────────────────────────────
create table quiz_questions (
  id              uuid primary key default gen_random_uuid(),
  module_id       uuid not null references training_modules(id) on delete cascade,
  question_text   text not null,
  question_type   quiz_question_type not null default 'multiple_choice',
  options         jsonb not null default '[]'::jsonb,
  explanation     text,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now()
);

create index idx_quiz_questions_module on quiz_questions(module_id);

-- ── 3. Training Assignments ─────────────────────────────────────────
create table training_assignments (
  id              uuid primary key default gen_random_uuid(),
  module_id       uuid not null references training_modules(id) on delete cascade,
  crew_member_id  uuid not null references crew_members(id) on delete cascade,
  assigned_by     uuid not null references crew_members(id) on delete restrict,
  deadline        date,
  status          training_status not null default 'assigned',
  assigned_at     timestamptz not null default now(),
  started_at      timestamptz,
  completed_at    timestamptz,
  unique (module_id, crew_member_id)
);

create index idx_training_assignments_module on training_assignments(module_id);
create index idx_training_assignments_crew   on training_assignments(crew_member_id);
create index idx_training_assignments_status on training_assignments(status);

-- ── 4. Quiz Attempts ────────────────────────────────────────────────
create table quiz_attempts (
  id              uuid primary key default gen_random_uuid(),
  assignment_id   uuid not null references training_assignments(id) on delete cascade,
  crew_member_id  uuid not null references crew_members(id) on delete cascade,
  score           int not null,
  passed          boolean not null,
  answers         jsonb not null default '[]'::jsonb,
  started_at      timestamptz not null default now(),
  completed_at    timestamptz
);

create index idx_quiz_attempts_assignment on quiz_attempts(assignment_id);
create index idx_quiz_attempts_crew       on quiz_attempts(crew_member_id);

-- ── RLS ─────────────────────────────────────────────────────────────
alter table training_modules    enable row level security;
alter table quiz_questions      enable row level security;
alter table training_assignments enable row level security;
alter table quiz_attempts       enable row level security;

-- training_modules: vessel crew can read published, admins can read all + write
create policy training_modules_select on training_modules for select using (
  exists (
    select 1 from crew_members cm
    where cm.id = auth.uid()
      and cm.vessel_id = training_modules.vessel_id
  )
);
create policy training_modules_insert on training_modules for insert with check (
  exists (
    select 1 from crew_members cm
    where cm.id = auth.uid()
      and cm.vessel_id = training_modules.vessel_id
      and cm.is_admin = true
  )
);
create policy training_modules_update on training_modules for update using (
  exists (
    select 1 from crew_members cm
    where cm.id = auth.uid()
      and cm.vessel_id = training_modules.vessel_id
      and cm.is_admin = true
  )
);
create policy training_modules_delete on training_modules for delete using (
  exists (
    select 1 from crew_members cm
    where cm.id = auth.uid()
      and cm.vessel_id = training_modules.vessel_id
      and cm.is_admin = true
  )
);

-- quiz_questions: readable by vessel crew (via module join), writable by admins
create policy quiz_questions_select on quiz_questions for select using (
  exists (
    select 1 from training_modules tm
      join crew_members cm on cm.vessel_id = tm.vessel_id
    where tm.id = quiz_questions.module_id
      and cm.id = auth.uid()
  )
);
create policy quiz_questions_insert on quiz_questions for insert with check (
  exists (
    select 1 from training_modules tm
      join crew_members cm on cm.vessel_id = tm.vessel_id
    where tm.id = quiz_questions.module_id
      and cm.id = auth.uid()
      and cm.is_admin = true
  )
);
create policy quiz_questions_update on quiz_questions for update using (
  exists (
    select 1 from training_modules tm
      join crew_members cm on cm.vessel_id = tm.vessel_id
    where tm.id = quiz_questions.module_id
      and cm.id = auth.uid()
      and cm.is_admin = true
  )
);
create policy quiz_questions_delete on quiz_questions for delete using (
  exists (
    select 1 from training_modules tm
      join crew_members cm on cm.vessel_id = tm.vessel_id
    where tm.id = quiz_questions.module_id
      and cm.id = auth.uid()
      and cm.is_admin = true
  )
);

-- training_assignments: crew can read own, admins can read all for vessel + write
create policy training_assignments_select on training_assignments for select using (
  crew_member_id = auth.uid()
  or exists (
    select 1 from training_modules tm
      join crew_members cm on cm.vessel_id = tm.vessel_id
    where tm.id = training_assignments.module_id
      and cm.id = auth.uid()
      and cm.is_admin = true
  )
);
create policy training_assignments_insert on training_assignments for insert with check (
  exists (
    select 1 from training_modules tm
      join crew_members cm on cm.vessel_id = tm.vessel_id
    where tm.id = training_assignments.module_id
      and cm.id = auth.uid()
      and cm.is_admin = true
  )
);
create policy training_assignments_update on training_assignments for update using (
  crew_member_id = auth.uid()
  or exists (
    select 1 from training_modules tm
      join crew_members cm on cm.vessel_id = tm.vessel_id
    where tm.id = training_assignments.module_id
      and cm.id = auth.uid()
      and cm.is_admin = true
  )
);
create policy training_assignments_delete on training_assignments for delete using (
  exists (
    select 1 from training_modules tm
      join crew_members cm on cm.vessel_id = tm.vessel_id
    where tm.id = training_assignments.module_id
      and cm.id = auth.uid()
      and cm.is_admin = true
  )
);

-- quiz_attempts: crew can read/insert own, admins can read all for vessel
create policy quiz_attempts_select on quiz_attempts for select using (
  crew_member_id = auth.uid()
  or exists (
    select 1 from training_assignments ta
      join training_modules tm on tm.id = ta.module_id
      join crew_members cm on cm.vessel_id = tm.vessel_id
    where ta.id = quiz_attempts.assignment_id
      and cm.id = auth.uid()
      and cm.is_admin = true
  )
);
create policy quiz_attempts_insert on quiz_attempts for insert with check (
  crew_member_id = auth.uid()
);

-- ── Realtime ────────────────────────────────────────────────────────
alter publication supabase_realtime add table training_assignments;
alter table training_assignments replica identity full;

-- ── Dev anon policies ───────────────────────────────────────────────
create policy training_modules_anon_select on training_modules for select to anon using (true);
create policy training_modules_anon_insert on training_modules for insert to anon with check (true);
create policy training_modules_anon_update on training_modules for update to anon using (true) with check (true);
create policy training_modules_anon_delete on training_modules for delete to anon using (true);

create policy quiz_questions_anon_select on quiz_questions for select to anon using (true);
create policy quiz_questions_anon_insert on quiz_questions for insert to anon with check (true);
create policy quiz_questions_anon_update on quiz_questions for update to anon using (true) with check (true);
create policy quiz_questions_anon_delete on quiz_questions for delete to anon using (true);

create policy training_assignments_anon_select on training_assignments for select to anon using (true);
create policy training_assignments_anon_insert on training_assignments for insert to anon with check (true);
create policy training_assignments_anon_update on training_assignments for update to anon using (true) with check (true);
create policy training_assignments_anon_delete on training_assignments for delete to anon using (true);

create policy quiz_attempts_anon_select on quiz_attempts for select to anon using (true);
create policy quiz_attempts_anon_insert on quiz_attempts for insert to anon with check (true);
create policy quiz_attempts_anon_update on quiz_attempts for update to anon using (true) with check (true);
create policy quiz_attempts_anon_delete on quiz_attempts for delete to anon using (true);
