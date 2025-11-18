-- Migration: Additional indexes for performance optimization
-- Some indexes may already be created in table migrations, this file ensures all are present

-- Parents table indexes (if not already created)
CREATE INDEX IF NOT EXISTS idx_parents_created_at ON mp_reading.parents(created_at);

-- Children table indexes (if not already created)
CREATE INDEX IF NOT EXISTS idx_children_grade_level ON mp_reading.children(grade_level);
CREATE INDEX IF NOT EXISTS idx_children_onboarding_status ON mp_reading.children(onboarding_completed) WHERE onboarding_completed = FALSE;
CREATE INDEX IF NOT EXISTS idx_children_created_at ON mp_reading.children(created_at);

-- Parent invitations composite indexes
CREATE INDEX IF NOT EXISTS idx_invitations_child_status ON mp_reading.parent_invitations(child_id, status);
CREATE INDEX IF NOT EXISTS idx_invitations_email_status ON mp_reading.parent_invitations(invited_email, status);

-- Onboarding data indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_completed_at ON mp_reading.onboarding_data(completed_at);

-- Data access logs composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_logs_child_timestamp ON mp_reading.data_access_logs(child_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_child_action ON mp_reading.data_access_logs(child_id, action);

