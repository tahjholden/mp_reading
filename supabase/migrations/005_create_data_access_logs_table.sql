-- Migration: Create data_access_logs table
-- Audit log for COPPA compliance

CREATE TABLE IF NOT EXISTS data_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES parents(id) ON DELETE SET NULL,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('read', 'create', 'update', 'delete')),
  table_name TEXT NOT NULL,
  record_id UUID,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE data_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only system/service role can insert logs (via triggers)
-- Note: This will be handled by service role in application code
CREATE POLICY "System can log data access"
  ON data_access_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Parents can view logs for their children (for transparency)
CREATE POLICY "Parents can view children's access logs"
  ON data_access_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = data_access_logs.child_id
      AND children.primary_parent_id = auth.uid()
    )
  );

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_logs_child ON data_access_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_logs_user ON data_access_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON data_access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_action ON data_access_logs(action);
CREATE INDEX IF NOT EXISTS idx_logs_table ON data_access_logs(table_name);

-- Partitioning by timestamp for performance (optional, for large scale)
-- CREATE TABLE data_access_logs_2025 PARTITION OF data_access_logs
--   FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

