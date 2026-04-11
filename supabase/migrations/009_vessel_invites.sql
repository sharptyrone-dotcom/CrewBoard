-- Invite code system + self-serve sign-up flow
--
-- Introduces:
--   1. vessel_invites table (admin-issued join codes)
--   2. RLS policies: admins manage their own vessel's invites; a permissive
--      SELECT policy lets the join page look up an invite before the user
--      has a session (required for the validateInviteCode call).
--   3. crew_members_insert_self policy so a freshly-signed-up auth user can
--      create their own crew_members row during the join flow (previous
--      migrations only defined SELECT + UPDATE on crew_members).
--   4. consume_vessel_invite(invite_id) — SECURITY DEFINER function that
--      decrements uses_remaining. Needed because the freshly-joined user
--      isn't an admin and would otherwise be blocked from updating
--      vessel_invites by the admin-only UPDATE policy below.
--
-- This migration has NOT yet been applied to the live DB — run it via the
-- Supabase SQL editor after reviewing it.

-- ---------------------------------------------------------------------------
-- 1. vessel_invites table
-- ---------------------------------------------------------------------------
create table if not exists vessel_invites (
  id                  uuid primary key default gen_random_uuid(),
  vessel_id           uuid not null references vessels(id) on delete cascade,
  code                text not null unique,
  role_preset         text,
  department_preset   department_enum,
  uses_remaining      integer not null default 1,
  expires_at          timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists idx_vessel_invites_code on vessel_invites(code);
create index if not exists idx_vessel_invites_vessel_id on vessel_invites(vessel_id);

alter table vessel_invites enable row level security;

-- ---------------------------------------------------------------------------
-- 2. vessel_invites RLS policies
-- ---------------------------------------------------------------------------
-- Admins on the same vessel can fully manage their invites.
drop policy if exists vessel_invites_admin_select on vessel_invites;
create policy vessel_invites_admin_select on vessel_invites
  for select to authenticated
  using (
    vessel_id = current_crew_vessel_id()
    and exists (
      select 1 from crew_members
      where id = auth.uid() and is_admin = true
    )
  );

drop policy if exists vessel_invites_admin_insert on vessel_invites;
create policy vessel_invites_admin_insert on vessel_invites
  for insert to authenticated
  with check (
    vessel_id = current_crew_vessel_id()
    and exists (
      select 1 from crew_members
      where id = auth.uid() and is_admin = true
    )
  );

drop policy if exists vessel_invites_admin_update on vessel_invites;
create policy vessel_invites_admin_update on vessel_invites
  for update to authenticated
  using (
    vessel_id = current_crew_vessel_id()
    and exists (
      select 1 from crew_members
      where id = auth.uid() and is_admin = true
    )
  )
  with check (
    vessel_id = current_crew_vessel_id()
    and exists (
      select 1 from crew_members
      where id = auth.uid() and is_admin = true
    )
  );

-- Permissive SELECT: the /join page needs to validate a code BEFORE the
-- user has an account. Since RLS policies are OR'd, this effectively makes
-- vessel_invites public-readable by code (the admin-select policy above is
-- then redundant but harmless; it's kept for documentation purposes).
--
-- Trade-off: an attacker who enumerates the vessel_invites table can see
-- every outstanding code. For the MVP this is acceptable — codes are
-- single-use by default and expire in a week, and no PII lives on this
-- table. If we need stronger guarantees, replace this with a SECURITY
-- DEFINER lookup_invite_by_code(text) function that never exposes the
-- full row set.
drop policy if exists vessel_invites_public_lookup on vessel_invites;
create policy vessel_invites_public_lookup on vessel_invites
  for select to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 3. crew_members_insert_self
-- ---------------------------------------------------------------------------
-- Allows a freshly-signed-up auth user to create their own crew_members row
-- during the join flow. The `id = auth.uid()` check ensures they can ONLY
-- insert a row keyed to their own auth identity, and the primary key on
-- crew_members.id prevents replays (a second INSERT fails with
-- duplicate-key, not a silent overwrite).
drop policy if exists crew_members_insert_self on crew_members;
create policy crew_members_insert_self on crew_members
  for insert to authenticated
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. consume_vessel_invite SECURITY DEFINER function
-- ---------------------------------------------------------------------------
-- Decrements uses_remaining by 1, clamped at 0. Runs as the function owner
-- (bypassing the admin-only UPDATE policy) so an authenticated but
-- non-admin user can consume a valid code during the join flow.
--
-- We do NOT validate the invite inside the function itself — the caller
-- (lib/invites.js validateInviteCode) is responsible for checking that the
-- invite is still valid before asking to consume it. Keeping the function
-- narrowly scoped to "decrement uses_remaining" minimises the attack
-- surface of the security-definer bypass.
create or replace function public.consume_vessel_invite(invite_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_remaining integer;
begin
  update vessel_invites
  set uses_remaining = greatest(0, uses_remaining - 1)
  where id = invite_id
  returning uses_remaining into new_remaining;
  return new_remaining;
end;
$$;

revoke all on function public.consume_vessel_invite(uuid) from public;
grant execute on function public.consume_vessel_invite(uuid) to anon, authenticated;
