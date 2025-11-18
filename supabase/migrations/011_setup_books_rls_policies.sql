-- Migration: Setup Row Level Security policies for books table
-- Books are publicly readable by all authenticated users
-- Only service role can create/update/delete books (admin operations)

-- Enable RLS
ALTER TABLE mp_reading.books ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read active books
CREATE POLICY "Books are readable by authenticated users"
  ON mp_reading.books FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- Policy: Service role can do everything (for admin operations)
-- Note: In production, you might want a more specific admin role
-- For now, service role is used for book management
CREATE POLICY "Service role can manage books"
  ON mp_reading.books FOR ALL
  USING (auth.role() = 'service_role');

-- Note: Regular authenticated users cannot insert, update, or delete books
-- This ensures only admins (via service role) can manage the catalog



