-- Migration: Create parents table
-- Parents are linked to Supabase Auth users

CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Parents can view their own profile
CREATE POLICY "Parents can view own profile"
  ON parents FOR SELECT
  USING (id = auth.uid());

-- RLS Policy: Parents can update their own profile
CREATE POLICY "Parents can update own profile"
  ON parents FOR UPDATE
  USING (id = auth.uid());

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parents_updated_at
  BEFORE UPDATE ON parents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_parents_email ON parents(email);

