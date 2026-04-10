// Vessel scoping. Once we support multiple vessels per user, this should be
// derived from the authenticated user's `crew_members.vessel_id` instead of
// being a hardcoded constant. The RLS policies already enforce vessel
// scoping via current_crew_vessel_id(), so this constant is now mostly a
// defense-in-depth filter on the query side.
export const CURRENT_VESSEL_ID = '10000000-0000-0000-0000-000000000001';
