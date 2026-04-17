/**
 * Authentication and authorisation helpers for API routes.
 *
 * Every API route should call `requireAuth(request)` at the top to verify the
 * caller's identity. Admin-only routes should use `requireAdmin(request)`.
 *
 * Both return { user, crewMember } on success or a NextResponse on failure.
 *
 * Usage:
 *   import { requireAuth, requireAdmin } from '@/lib/authCheck';
 *
 *   export async function GET(request) {
 *     const auth = await requireAuth(request);
 *     if (auth.response) return auth.response; // 401
 *     const { user, crewMember } = auth;
 *     // user.id, crewMember.vessel_id, crewMember.is_admin, etc.
 *   }
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Create a Supabase server client from the current request cookies.
 */
async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // In Server Components / read-only contexts, setting cookies
            // is a no-op. The middleware handles refresh for those cases.
          }
        },
      },
    },
  );
}

/**
 * Verify that the request comes from an authenticated user.
 * Returns the Supabase user and matching crew_members row.
 *
 * On failure returns { response: NextResponse } with a 401 status.
 */
export async function requireAuth() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        response: NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 },
        ),
      };
    }

    // Look up crew_members row for vessel scoping and admin checks
    const { data: crewMember, error: crewError } = await supabase
      .from('crew_members')
      .select('id, vessel_id, full_name, role, is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (crewError || !crewMember) {
      return {
        response: NextResponse.json(
          { error: 'Unauthorized — no crew profile found' },
          { status: 401 },
        ),
      };
    }

    return { user, crewMember, supabase };
  } catch (err) {
    console.error('[authCheck] unexpected error:', err);
    return {
      response: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 },
      ),
    };
  }
}

/**
 * Verify that the request comes from an authenticated admin.
 * Returns the same shape as requireAuth(), but returns 403 if the user
 * is authenticated but not an admin.
 */
export async function requireAdmin() {
  const auth = await requireAuth();
  if (auth.response) return auth; // 401

  if (!auth.crewMember.is_admin) {
    return {
      response: NextResponse.json(
        { error: 'Forbidden — admin access required' },
        { status: 403 },
      ),
    };
  }

  return auth;
}
