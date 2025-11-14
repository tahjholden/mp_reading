-- Migration: Create parent_invitations table
-- Tracks invitations from primary parents to secondary parents

CREATE TABLE IF NOT EXISTS parent_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by_parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by_parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE parent_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Primary parents can view invitations they sent
CREATE POLICY "Parents can view sent invitations"
  ON parent_invitations FOR SELECT
  USING (invited_by_parent_id = auth.uid());

-- RLS Policy: Primary parents can create invitations for their children
CREATE POLICY "Primary parents can create invitations"
  ON parent_invitations FOR INSERT
  WITH CHECK (
    invited_by_parent_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = parent_invitations.child_id
      AND children.primary_parent_id = auth.uid()
    )
  );

-- RLS Policy: Primary parents can update invitations they sent
CREATE POLICY "Primary parents can update sent invitations"
  ON parent_invitations FOR UPDATE
  USING (invited_by_parent_id = auth.uid());

-- RLS Policy: Invited parents can view invitations sent to their email
CREATE POLICY "Invited parents can view their invitations"
  ON parent_invitations FOR SELECT
  USING (
    invited_email = (
      SELECT email FROM parents WHERE id = auth.uid()
    )
  );

-- RLS Policy: Invited parents can accept invitations sent to their email
CREATE POLICY "Invited parents can accept invitations"
  ON parent_invitations FOR UPDATE
  USING (
    invited_email = (
      SELECT email FROM parents WHERE id = auth.uid()
    )
    AND status = 'pending'
    AND expires_at > NOW()
  )
  WITH CHECK (status = 'accepted');

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_token ON parent_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_child ON parent_invitations(child_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON parent_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON parent_invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_expires ON parent_invitations(expires_at) WHERE status = 'pending';

