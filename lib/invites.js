import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// lib/invites.js
// ---------------------------------------------------------------------------
// Thin wrapper around the vessel_invites table + the consume_vessel_invite
// RPC defined in migration 009. Three distinct callers use this module:
//
//   1. admin UI (app/admin/invites/page.js)       — create + list
//   2. join flow (app/join/page.js)               — validate + consume
//   3. future: reminder emails / expiry cleanups  — list + possibly delete
//
// RLS notes:
//   - SELECT: there's a permissive "anyone can read" policy so the join
//     flow can validate a code pre-auth. Admins ALSO have a restrictive
//     policy, but it's redundant because policies are OR'd.
//   - INSERT / UPDATE: admin-only. createInvite must be called from an
//     admin session.
//   - CONSUME: goes through the SECURITY DEFINER RPC so a freshly-joined
//     non-admin user can decrement uses_remaining without tripping the
//     admin-only UPDATE policy.
// ---------------------------------------------------------------------------

// Restricted alphabet: no 0/O, 1/I/L, or lowercase — these are the
// characters most likely to get misread when a code is read aloud over a
// noisy intercom or typed from a handwritten scrap of paper.
const INVITE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

// Generates an 8-character uppercase alphanumeric invite code from the
// restricted alphabet. Cryptographic randomness isn't required — invite
// codes only need to be unguessable for the lifetime of the invite, and
// the uniqueness guarantee comes from the database unique constraint.
export function generateInviteCode(length = 8) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += INVITE_ALPHABET[Math.floor(Math.random() * INVITE_ALPHABET.length)];
  }
  return code;
}

// Creates a new invite for the given vessel. Retries on unique-constraint
// collisions up to 5 times so we don't fail the user's click with a spurious
// "try again" error on the (rare) event of a random code clash.
//
// Requires an admin session on the target vessel. Any other caller will
// trip the vessel_invites_admin_insert RLS policy and get a clean error.
export async function createInvite(vesselId, {
  rolePreset,
  departmentPreset,
  usesRemaining = 1,
  expiresAt,
} = {}) {
  if (!vesselId) throw new Error('vesselId is required');

  const MAX_ATTEMPTS = 5;
  let lastError = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateInviteCode();
    const { data, error } = await supabase
      .from('vessel_invites')
      .insert({
        vessel_id: vesselId,
        code,
        role_preset: rolePreset || null,
        department_preset: departmentPreset || null,
        uses_remaining: usesRemaining,
        expires_at: expiresAt || null,
      })
      .select('*')
      .single();

    if (!error) return data;
    lastError = error;

    // Postgres unique-violation SQLSTATE — retry with a fresh code.
    if (error.code !== '23505') {
      console.error('[invites] create failed', error);
      throw error;
    }
  }

  console.error('[invites] create exhausted retries', lastError);
  throw new Error('Could not generate a unique invite code. Try again.');
}

// Validates an invite code for the join flow. Returns the invite row if
// the code exists AND has uses_remaining > 0 AND hasn't expired, or null
// otherwise. Callers should treat null as "invalid" and show a user-facing
// error. Network / unexpected errors still throw.
export async function validateInviteCode(code) {
  if (!code || typeof code !== 'string') return null;
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const { data, error } = await supabase
    .from('vessel_invites')
    .select('*')
    .eq('code', normalized)
    .maybeSingle();

  if (error) {
    console.error('[invites] validate failed', error);
    throw error;
  }
  if (!data) return null;
  if (data.uses_remaining <= 0) return null;
  if (data.expires_at && new Date(data.expires_at) <= new Date()) return null;
  return data;
}

// Decrements uses_remaining by 1 via the consume_vessel_invite SECURITY
// DEFINER RPC. Returns the new remaining count. The caller is expected to
// have already validated the invite via validateInviteCode — this function
// is deliberately dumb so the RPC stays minimal.
export async function consumeInvite(inviteId) {
  if (!inviteId) throw new Error('inviteId is required');
  const { data, error } = await supabase.rpc('consume_vessel_invite', {
    invite_id: inviteId,
  });
  if (error) {
    console.error('[invites] consume failed', error);
    throw error;
  }
  return data;
}

// Lists all invites for a vessel, newest first. Used by the admin invites
// page to render the existing-codes list. Depends on the admin SELECT
// policy (or the permissive lookup policy) from migration 009.
export async function listInvitesForVessel(vesselId) {
  if (!vesselId) return [];
  const { data, error } = await supabase
    .from('vessel_invites')
    .select('*')
    .eq('vessel_id', vesselId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[invites] list failed', error);
    throw error;
  }
  return data || [];
}
