import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { handleApiError } from '@/lib/apiError';

// ---------------------------------------------------------------------------
// /api/signup/vessel
//
// POST — server-side completion of the new-vessel signup flow.
//
// The /signup/vessel page does the supabase.auth.signUp on the client so the
// user ends up with an active session immediately. It then POSTs to this
// route with the resulting userId plus the vessel details. The route does
// the four writes that need to happen together, all through the service
// role client because there is no crew_member row yet (every RLS policy
// keys off current_crew_vessel_id(), which would return null):
//
//   1) vessels        — the vessel record
//   2) crew_members   — the admin user (is_admin=true), id = auth userId
//   3) custom_departments — the vessel's initial departments (one row each)
//   4) vessel_subscriptions — trialing status with trial_ends_at = now()+30d
//
// On any failure the route tries to undo the writes it already did so we
// don't leave orphan vessels. Failures during cleanup are logged but the
// original error is still returned to the client.
// ---------------------------------------------------------------------------

// Tighter limit than the default writeLimiter because this endpoint creates
// a user + vessel on every call — a bot hammering it could fill the DB.
const signupLimiter = rateLimit({ max: 5, windowMs: 60_000 });

const BUILTIN_DEPARTMENTS = new Set(['Bridge', 'Deck', 'Engine', 'Interior', 'Safety', 'General']);

function deriveInitials(fullName) {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export async function POST(request) {
  try {
    const limited = signupLimiter(request);
    if (limited) return limited;

    const body = await request.json();
    const {
      userId,
      email,
      fullName,
      role,
      vesselName,
      vesselType,
      departments,
    } = body || {};

    // ----- Validation -------------------------------------------------------
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Missing userId.' }, { status: 400 });
    }
    if (!email?.trim() || !fullName?.trim() || !role?.trim()) {
      return NextResponse.json(
        { error: 'Name, email, and role are required.' },
        { status: 400 },
      );
    }
    if (!vesselName?.trim()) {
      return NextResponse.json({ error: 'Vessel name is required.' }, { status: 400 });
    }

    // Confirm the Supabase Auth user actually exists before we write anything
    // else — if the client lied about userId (or something went wrong during
    // signUp), we want to surface that clearly instead of creating an orphan
    // vessel tied to a non-existent user.
    const { data: authUser, error: authLookupErr } =
      await supabaseAdmin.auth.admin.getUserById(userId);
    if (authLookupErr || !authUser?.user) {
      return NextResponse.json(
        { error: 'Your account could not be verified. Please try again.' },
        { status: 400 },
      );
    }

    // Filter custom departments — only insert the ones that are not builtin,
    // and cap the length so we don't blow the 50-char column constraint.
    const rawDepartments = Array.isArray(departments) ? departments : [];
    const customDepartmentLabels = Array.from(
      new Set(
        rawDepartments
          .map((d) => (typeof d === 'string' ? d.trim() : ''))
          .filter(Boolean)
          .filter((d) => !BUILTIN_DEPARTMENTS.has(d))
          .map((d) => d.slice(0, 50)),
      ),
    );

    // ----- 1) Vessel --------------------------------------------------------
    const { data: vessel, error: vesselErr } = await supabaseAdmin
      .from('vessels')
      .insert({
        name: vesselName.trim().slice(0, 120),
        vessel_type: vesselType?.trim() || null,
      })
      .select('id')
      .single();
    if (vesselErr) throw vesselErr;

    const vesselId = vessel.id;

    // Helper that rolls back the vessel row (cascades to crew_members,
    // custom_departments, vessel_subscriptions via foreign keys) so a
    // partial failure doesn't leave the DB in a bad state.
    const rollback = async (reason) => {
      console.warn('[signup/vessel] rolling back vessel', vesselId, reason);
      try {
        await supabaseAdmin.from('vessels').delete().eq('id', vesselId);
      } catch (cleanupErr) {
        console.error('[signup/vessel] rollback failed', cleanupErr);
      }
    };

    // ----- 2) Crew member (admin) ------------------------------------------
    const { error: crewErr } = await supabaseAdmin.from('crew_members').insert({
      id: userId,
      vessel_id: vesselId,
      email: email.trim(),
      full_name: fullName.trim(),
      role: role.trim(),
      department: 'General',
      is_admin: true,
      is_hod: false,
      avatar_initials: deriveInitials(fullName),
      is_active: true,
    });
    if (crewErr) {
      await rollback(crewErr);
      // Postgres unique-violation code → friendlier message
      if (crewErr.code === '23505') {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please log in instead.' },
          { status: 409 },
        );
      }
      throw crewErr;
    }

    // ----- 3) Custom departments -------------------------------------------
    if (customDepartmentLabels.length > 0) {
      const deptRows = customDepartmentLabels.map((label) => ({
        vessel_id: vesselId,
        label,
        created_by: userId,
      }));
      const { error: deptErr } = await supabaseAdmin
        .from('custom_departments')
        .insert(deptRows);
      if (deptErr) {
        // Non-fatal: the vessel is usable without custom departments — we
        // log it and continue rather than rolling back the whole signup.
        console.warn('[signup/vessel] custom_departments insert failed', deptErr);
      }
    }

    // ----- 4) Subscription (30-day trial) ----------------------------------
    const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error: subErr } = await supabaseAdmin
      .from('vessel_subscriptions')
      .insert({
        vessel_id: vesselId,
        status: 'trialing',
        trial_ends_at: trialEndsAt,
      });
    if (subErr) {
      // The subscriptions table is new (migration 024) — in deployments
      // where that migration hasn't been applied yet, log and continue so
      // the signup still completes. An admin can backfill the row later.
      console.warn('[signup/vessel] vessel_subscriptions insert failed (non-fatal)', subErr);
    }

    return NextResponse.json({
      success: true,
      vesselId,
      trialEndsAt,
    });
  } catch (err) {
    return handleApiError(err, 'signup/vessel/POST');
  }
}
