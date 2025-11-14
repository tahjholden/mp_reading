-- Migration: Create onboarding_data table
-- Stores child onboarding responses

CREATE TABLE IF NOT EXISTS onboarding_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID UNIQUE NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  reading_interest_survey JSONB NOT NULL,
  avatar_choices JSONB NOT NULL,
  initial_goals JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE onboarding_data ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Parents can view onboarding data for their children
CREATE POLICY "Parents can view children's onboarding data"
  ON onboarding_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = onboarding_data.child_id
      AND (
        children.primary_parent_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM parent_invitations
          WHERE parent_invitations.child_id = children.id
          AND parent_invitations.invited_email = (
            SELECT email FROM parents WHERE id = auth.uid()
          )
          AND parent_invitations.status = 'accepted'
        )
      )
    )
  );

-- RLS Policy: Only primary parents can create onboarding data
CREATE POLICY "Primary parents can create onboarding data"
  ON onboarding_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = onboarding_data.child_id
      AND children.primary_parent_id = auth.uid()
    )
  );

-- RLS Policy: Only primary parents can update onboarding data
CREATE POLICY "Primary parents can update onboarding data"
  ON onboarding_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = onboarding_data.child_id
      AND children.primary_parent_id = auth.uid()
    )
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_onboarding_child ON onboarding_data(child_id);

