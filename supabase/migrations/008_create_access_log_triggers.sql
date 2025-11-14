-- Migration: Create database triggers for data access logging
-- Automatically logs all access to child data for COPPA compliance

-- Function to log data access
CREATE OR REPLACE FUNCTION log_child_data_access()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
  record_uuid UUID;
  user_uuid UUID;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'create';
    record_uuid := NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'update';
    record_uuid := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'delete';
    record_uuid := OLD.id;
  ELSIF TG_OP = 'SELECT' THEN
    action_type := 'read';
    record_uuid := NEW.id; -- For SELECT, NEW may not exist, handled in application
  END IF;

  -- Get current user ID (if parent)
  user_uuid := auth.uid();

  -- Insert log entry
  -- Note: For SELECT operations, this will be handled in application layer
  -- as triggers don't fire on SELECT in PostgreSQL
  IF TG_OP != 'SELECT' THEN
    INSERT INTO data_access_logs (
      user_id,
      child_id,
      action,
      table_name,
      record_id
    ) VALUES (
      user_uuid,
      COALESCE(NEW.id, OLD.id),
      action_type,
      TG_TABLE_NAME,
      record_uuid
    );
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for children table (INSERT, UPDATE, DELETE)
CREATE TRIGGER log_children_access
  AFTER INSERT OR UPDATE OR DELETE ON children
  FOR EACH ROW
  EXECUTE FUNCTION log_child_data_access();

-- Trigger for onboarding_data table
CREATE TRIGGER log_onboarding_access
  AFTER INSERT OR UPDATE OR DELETE ON onboarding_data
  FOR EACH ROW
  EXECUTE FUNCTION log_child_data_access();

-- Trigger for parent_invitations table (when related to children)
CREATE TRIGGER log_invitation_access
  AFTER INSERT OR UPDATE OR DELETE ON parent_invitations
  FOR EACH ROW
  EXECUTE FUNCTION log_child_data_access();

-- Note: SELECT operations are logged in application layer via middleware
-- as PostgreSQL triggers don't fire on SELECT statements

