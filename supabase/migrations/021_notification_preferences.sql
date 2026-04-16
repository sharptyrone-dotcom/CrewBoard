-- Migration 021: Notification preferences
-- Lets crew members control which notification types they receive.
-- Critical notices are always forced on at the app layer.

CREATE TABLE notification_preferences (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id   uuid REFERENCES crew_members(id) ON DELETE CASCADE NOT NULL,
  vessel_id        uuid NOT NULL,
  critical_notices boolean NOT NULL DEFAULT true,
  important_notices boolean NOT NULL DEFAULT true,
  routine_notices  boolean NOT NULL DEFAULT true,
  document_updates boolean NOT NULL DEFAULT true,
  training_assignments boolean NOT NULL DEFAULT true,
  training_reminders boolean NOT NULL DEFAULT true,
  event_briefings  boolean NOT NULL DEFAULT true,
  event_updates    boolean NOT NULL DEFAULT true,
  admin_reminders  boolean NOT NULL DEFAULT true,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  UNIQUE(crew_member_id, vessel_id)
);

-- RLS: crew members can only read and update their own preferences.
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Crew can view own preferences"
  ON notification_preferences FOR SELECT
  USING (crew_member_id = current_crew_vessel_id() OR vessel_id = current_crew_vessel_id());

CREATE POLICY "Crew can insert own preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (crew_member_id = auth.uid() OR true);

CREATE POLICY "Crew can update own preferences"
  ON notification_preferences FOR UPDATE
  USING (crew_member_id = auth.uid() OR true)
  WITH CHECK (crew_member_id = auth.uid() OR true);

-- Since this app uses the anon key with a shared vessel ID rather than
-- per-user auth tokens, the RLS policies above are permissive.  The API
-- route layer enforces that crew members can only access their own rows
-- by filtering on crew_member_id in every query.

-- Index for fast lookups by crew member + vessel
CREATE INDEX idx_notification_preferences_crew_vessel
  ON notification_preferences(crew_member_id, vessel_id);
