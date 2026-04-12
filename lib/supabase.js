import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Set them in .env.local before using the client.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// ── Server-only admin client (bypasses RLS) ──────────────────────────────────
// Uses SUPABASE_SERVICE_ROLE_KEY — a server-only env var that is never bundled
// into browser code.  Import this ONLY in app/api/ route handlers.
// Falls back to the anon key during local dev / CI when the service role key
// hasn't been configured yet — API routes will still work but may hit RLS.
const _serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (typeof window === 'undefined' && !_serviceKey) {
  console.warn(
    '[supabase] SUPABASE_SERVICE_ROLE_KEY is not set — API routes will fall ' +
    'back to the anon key and may fail on RLS-protected tables.',
  );
}
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  _serviceKey || supabaseAnonKey || '',
);

export default supabase;
