-- Migration: Additional indexes for performance optimization
-- Some indexes may already be created in table migrations, this file ensures all are present

-- Parents table indexes (if not already created)
CREATE INDEX IF NOT EXISTS idx_parents_created_at ON parents(created_at);

-- Children table indexes (if not already created)
CREATE INDEX IF NOT EXISTS idx_children_grade_level ON children(grade_level);
CREATE INDEX IF NOT EXISTS idx_children_onboarding_status ON children(onboarding_completed) WHERE onboarding_completed = FALSE;
CREATE INDEX IF NOT EXISTS idx_children_created_at ON children(created_at);

-- Parent invitations composite indexes
CREATE INDEX IF NOT EXISTS idx_invitations_child_status ON parent_invitations(child_id, status);
CREATE INDEX IF NOT EXISTS idx_invitations_email_status ON parent_invitations(invited_email, status);

-- Onboarding data indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_completed_at ON onboarding_data(completed_at);

-- Data access logs composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_logs_child_timestamp ON data_access_logs(child_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_child_action ON data_access_logs(child_id, action);

