-- Migration: Setup Row Level Security Policies
-- Note: Some policies are created in table migrations, this file ensures all are present
-- This migration can be run to verify/update policies if needed

-- Parents table policies (already created in 001, but ensuring they exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'mp_reading' AND tablename = 'parents' AND policyname = 'Parents can view own profile'
  ) THEN
    CREATE POLICY "Parents can view own profile"
      ON mp_reading.parents FOR SELECT
      USING (id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'mp_reading' AND tablename = 'parents' AND policyname = 'Parents can update own profile'
  ) THEN
    CREATE POLICY "Parents can update own profile"
      ON mp_reading.parents FOR UPDATE
      USING (id = auth.uid());
  END IF;
END $$;

-- Children table policies (already created in 002, but ensuring they exist)
-- Note: Child session policy requires custom function - will be implemented in application layer
-- For now, children access is handled via application-level authentication

-- Parent invitations policies (already created in 003)
-- Onboarding data policies (already created in 004)
-- Data access logs policies (already created in 005)

-- Verify all RLS is enabled
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'mp_reading' 
    AND tablename IN ('parents', 'children', 'parent_invitations', 'onboarding_data', 'data_access_logs')
  LOOP
    EXECUTE format('ALTER TABLE mp_reading.%I ENABLE ROW LEVEL SECURITY', table_name);
  END LOOP;
END $$;

