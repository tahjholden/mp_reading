-- Migration: Create onboarding_data table
-- Stores child onboarding responses

CREATE TABLE IF NOT EXISTS mp_reading.onboarding_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID UNIQUE NOT NULL REFERENCES mp_reading.children(id) ON DELETE CASCADE,
  reading_interest_survey JSONB NOT NULL,
  avatar_choices JSONB NOT NULL,
  initial_goals JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE mp_reading.onboarding_data ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Parents can view onboarding data for their children
CREATE POLICY "Parents can view children's onboarding data"
  ON mp_reading.onboarding_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mp_reading.children
      WHERE mp_reading.children.id = mp_reading.onboarding_data.child_id
      AND (
        mp_reading.children.primary_parent_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM mp_reading.parent_invitations
          WHERE mp_reading.parent_invitations.child_id = mp_reading.children.id
          AND mp_reading.parent_invitations.invited_email = (
            SELECT email FROM mp_reading.parents WHERE id = auth.uid()
          )
          AND mp_reading.parent_invitations.status = 'accepted'
        )
      )
    )
  );

-- RLS Policy: Only primary parents can create onboarding data
CREATE POLICY "Primary parents can create onboarding data"
  ON mp_reading.onboarding_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mp_reading.children
      WHERE mp_reading.children.id = mp_reading.onboarding_data.child_id
      AND mp_reading.children.primary_parent_id = auth.uid()
    )
  );

-- RLS Policy: Only primary parents can update onboarding data
CREATE POLICY "Primary parents can update onboarding data"
  ON mp_reading.onboarding_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM mp_reading.children
      WHERE mp_reading.children.id = mp_reading.onboarding_data.child_id
      AND mp_reading.children.primary_parent_id = auth.uid()
    )
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_onboarding_child ON mp_reading.onboarding_data(child_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON mp_reading.onboarding_data TO authenticated;
GRANT ALL ON mp_reading.onboarding_data TO service_role;

