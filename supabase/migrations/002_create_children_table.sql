-- Migration: Create children table
-- Children use username/password authentication (not Supabase Auth)

CREATE TABLE IF NOT EXISTS mp_reading.children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primary_parent_id UUID NOT NULL REFERENCES mp_reading.parents(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age BETWEEN 9 AND 12),
  grade_level INTEGER NOT NULL CHECK (grade_level IN (4, 5, 6)),
  email TEXT,
  reading_preferences JSONB DEFAULT '{}'::jsonb,
  avatar_data JSONB DEFAULT '{}'::jsonb,
  reading_level INTEGER,
  onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE mp_reading.children ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Primary parents can view their children
-- Secondary parents can view children they're invited to (read-only)
CREATE POLICY "Parents can view their children"
  ON mp_reading.children FOR SELECT
  USING (
    primary_parent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM mp_reading.parent_invitations
      WHERE mp_reading.parent_invitations.child_id = mp_reading.children.id
      AND mp_reading.parent_invitations.invited_email = (
        SELECT email FROM mp_reading.parents WHERE id = auth.uid()
      )
      AND mp_reading.parent_invitations.status = 'accepted'
    )
  );

-- RLS Policy: Only primary parents can insert children
CREATE POLICY "Primary parents can create children"
  ON mp_reading.children FOR INSERT
  WITH CHECK (primary_parent_id = auth.uid());

-- RLS Policy: Only primary parents can update their children
CREATE POLICY "Primary parents can update their children"
  ON mp_reading.children FOR UPDATE
  USING (primary_parent_id = auth.uid())
  WITH CHECK (primary_parent_id = auth.uid());

-- RLS Policy: Only primary parents can delete their children
CREATE POLICY "Primary parents can delete their children"
  ON mp_reading.children FOR DELETE
  USING (primary_parent_id = auth.uid());

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON mp_reading.children
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_children_username ON mp_reading.children(username);
CREATE INDEX IF NOT EXISTS idx_children_primary_parent ON mp_reading.children(primary_parent_id);
CREATE INDEX IF NOT EXISTS idx_children_email ON mp_reading.children(email) WHERE email IS NOT NULL;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON mp_reading.children TO authenticated;
GRANT ALL ON mp_reading.children TO service_role;

