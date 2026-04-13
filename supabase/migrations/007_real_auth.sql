-- Real auth cutover
--
-- Seeds auth.users + auth.identities matching the existing crew_members
-- rows (so auth.uid() = crew_members.id, which is what the strict RLS
-- policies in 001 rely on), then drops every dev_anon_* policy introduced
-- in migrations 002–006.
--
-- After this migration the app requires a real login. The POC dev
-- password is 'CrewNotice2026' for every seeded account — rotate it before
-- sharing the URL with anyone outside the dev team.
--
-- This migration was applied to the live DB via MCP during development.
-- It's committed here so fresh clones of the database can reproduce the
-- cutover deterministically.
--
-- Amendment (2026-04-11)
-- ----------------------
-- The original INSERT below omitted the GoTrue token columns
-- (confirmation_token, recovery_token, email_change, email_change_token_new,
-- email_change_token_current, reauthentication_token). Those columns
-- default to NULL, but Supabase GoTrue scans them into Go strings at login
-- time and panics with "converting NULL to string is unsupported" — which
-- surfaces in the client as "Database error querying schema".
--
-- The INSERT is now explicit about each of those columns being '' so fresh
-- clones don't need a follow-up backfill migration. The hotfix for the
-- already-provisioned live database was applied via MCP on 2026-04-11;
-- re-running this migration is still a no-op there thanks to the
-- `on conflict (id) do nothing` clause.

-- ---------------------------------------------------------------------------
-- 1. Create auth.users + auth.identities for every seeded crew member.
--    We re-use the crew_members.id as the auth.users.id so the SECURITY
--    DEFINER helper `current_crew_vessel_id()` can match rows via auth.uid().
-- ---------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  is_sso_user, is_anonymous,
  -- Token columns must be empty strings, not NULL — see amendment note
  -- above. GoTrue panics on NULL during the Scan into a Go string.
  confirmation_token, recovery_token,
  email_change, email_change_token_new,
  email_change_token_current, reauthentication_token
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  cm.id,
  'authenticated',
  'authenticated',
  cm.email,
  crypt('CrewNotice2026', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', cm.full_name),
  false,
  false,
  false,
  '', '',
  '', '',
  '', ''
from crew_members cm
where cm.vessel_id = '10000000-0000-0000-0000-000000000001'
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data,
  last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(),
  cm.id,
  cm.id::text,
  'email',
  jsonb_build_object(
    'sub', cm.id::text,
    'email', cm.email,
    'email_verified', true
  ),
  now(), now(), now()
from crew_members cm
where cm.vessel_id = '10000000-0000-0000-0000-000000000001'
on conflict (provider_id, provider) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Drop every dev_anon_* policy. The strict policies from 001 are the
--    only thing left guarding these tables from this point on.
-- ---------------------------------------------------------------------------
drop policy if exists dev_anon_activity_insert on activity_log;
drop policy if exists dev_anon_activity_select on activity_log;
drop policy if exists dev_anon_crew_members_update on crew_members;
drop policy if exists dev_anon_crew_select on crew_members;
drop policy if exists dev_anon_doc_acks_insert on document_acknowledgements;
drop policy if exists dev_anon_doc_acks_select on document_acknowledgements;
drop policy if exists dev_anon_doc_acks_update on document_acknowledgements;
drop policy if exists dev_anon_documents_delete on documents;
drop policy if exists dev_anon_documents_insert on documents;
drop policy if exists dev_anon_documents_select on documents;
drop policy if exists dev_anon_documents_update on documents;
drop policy if exists dev_anon_notice_reads_insert on notice_reads;
drop policy if exists dev_anon_notice_reads_select on notice_reads;
drop policy if exists dev_anon_notice_reads_update on notice_reads;
drop policy if exists dev_anon_notices_insert on notices;
drop policy if exists dev_anon_notices_select on notices;
drop policy if exists dev_anon_notices_update on notices;
drop policy if exists dev_anon_notifications_insert on notifications;
drop policy if exists dev_anon_notifications_select on notifications;
drop policy if exists dev_anon_notifications_update on notifications;
drop policy if exists dev_anon_vessels on vessels;
