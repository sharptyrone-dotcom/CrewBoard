-- Remove notification preferences
--
-- CrewNotice does not support per-crew notification opt-outs. Every crew
-- member on a vessel must receive every notification targeted at them
-- (department-filtered where appropriate) so compliance tracking has an
-- auditable guarantee of delivery. The `notification_preferences` table
-- and all of its supporting infrastructure are therefore removed.
--
-- This migration drops the table with CASCADE so any lingering RLS
-- policies, indexes, or foreign keys that referenced it are cleaned up in
-- one pass. The only production code paths that used this table were
-- `lib/notificationSender.js` and `app/api/events/route.js`; both have
-- been updated to stop reading it.
--
-- This migration has NOT yet been applied to the live DB — run it via
-- the Supabase SQL editor after reviewing it.

drop table if exists notification_preferences cascade;
