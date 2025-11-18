-- Migration: Create parents table
-- Parents are linked to Supabase Auth users

CREATE SCHEMA IF NOT EXISTS mp_reading;

CREATE TABLE IF NOT EXISTS mp_reading.parents (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE mp_reading.parents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Parents can view their own profile
CREATE POLICY "Parents can view own profile"
  ON mp_reading.parents FOR SELECT
  USING (id = auth.uid());

-- RLS Policy: Parents can update their own profile
CREATE POLICY "Parents can update own profile"
  ON mp_reading.parents FOR UPDATE
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
  BEFORE UPDATE ON mp_reading.parents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_parents_email ON mp_reading.parents(email);

-- Grant permissions
GRANT USAGE ON SCHEMA mp_reading TO authenticated;
GRANT USAGE ON SCHEMA mp_reading TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON mp_reading.parents TO authenticated;
GRANT ALL ON mp_reading.parents TO service_role;

