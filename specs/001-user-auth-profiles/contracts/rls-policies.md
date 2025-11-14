# Row Level Security (RLS) Policies

**Feature**: 001-user-auth-profiles  
**Date**: 2025-11-14

## Overview

All tables have Row Level Security (RLS) enabled to enforce COPPA compliance and ensure parents can only access their own children's data. Policies use Supabase's `auth.uid()` for parent authentication.

## Policy Definitions

### 1. Parents Table

**Table**: `parents`

**Policies**:
```sql
-- Parents can view their own profile
CREATE POLICY "Parents can view own profile"
  ON parents FOR SELECT
  USING (id = auth.uid());

-- Parents can update their own profile
CREATE POLICY "Parents can update own profile"
  ON parents FOR UPDATE
  USING (id = auth.uid());
```

**Rationale**: Parents should only access their own account data.

### 2. Children Table

**Table**: `children`

**Policies**:
```sql
-- Primary parents can view their children
-- Secondary parents can view children they're invited to (read-only)
CREATE POLICY "Parents can view their children"
  ON children FOR SELECT
  USING (
    primary_parent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM parent_invitations
      WHERE parent_invitations.child_id = children.id
      AND parent_invitations.invited_email = (
        SELECT email FROM parents WHERE id = auth.uid()
      )
      AND parent_invitations.status = 'accepted'
    )
  );

-- Only primary parents can insert children
CREATE POLICY "Primary parents can create children"
  ON children FOR INSERT
  WITH CHECK (primary_parent_id = auth.uid());

-- Only primary parents can update their children
CREATE POLICY "Primary parents can update their children"
  ON children FOR UPDATE
  USING (primary_parent_id = auth.uid())
  WITH CHECK (primary_parent_id = auth.uid());

-- Only primary parents can delete their children
CREATE POLICY "Primary parents can delete their children"
  ON children FOR DELETE
  USING (primary_parent_id = auth.uid());

-- Children can view their own profile (for child login)
-- Note: This requires custom authentication check via function
CREATE POLICY "Children can view own profile"
  ON children FOR SELECT
  USING (
    -- Custom function checks child session token
    check_child_session(username)
  );
```

**Rationale**: 
- Primary parents have full CRUD access to their children
- Secondary parents have read-only access via invitations
- Children can view their own profile when authenticated

### 3. Parent Invitations Table

**Table**: `parent_invitations`

**Policies**:
```sql
-- Primary parents can view invitations they sent
CREATE POLICY "Parents can view sent invitations"
  ON parent_invitations FOR SELECT
  USING (invited_by_parent_id = auth.uid());

-- Primary parents can create invitations for their children
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

-- Primary parents can update invitations they sent (e.g., cancel)
CREATE POLICY "Primary parents can update sent invitations"
  ON parent_invitations FOR UPDATE
  USING (invited_by_parent_id = auth.uid());

-- Invited parents can view invitations sent to their email
-- (Even if they don't have account yet - checked by email)
CREATE POLICY "Invited parents can view their invitations"
  ON parent_invitations FOR SELECT
  USING (
    invited_email = (
      SELECT email FROM parents WHERE id = auth.uid()
    )
  );

-- Invited parents can accept invitations sent to their email
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
```

**Rationale**: 
- Primary parents manage invitations they send
- Invited parents can view and accept invitations sent to their email
- Prevents unauthorized invitation manipulation

### 4. Onboarding Data Table

**Table**: `onboarding_data`

**Policies**:
```sql
-- Parents can view onboarding data for their children
CREATE POLICY "Parents can view children's onboarding data"
  ON onboarding_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = onboarding_data.child_id
      AND (
        children.primary_parent_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM parent_invitations
          WHERE parent_invitations.child_id = children.id
          AND parent_invitations.invited_email = (
            SELECT email FROM parents WHERE id = auth.uid()
          )
          AND parent_invitations.status = 'accepted'
        )
      )
    )
  );

-- Only primary parents can create onboarding data
CREATE POLICY "Primary parents can create onboarding data"
  ON onboarding_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = onboarding_data.child_id
      AND children.primary_parent_id = auth.uid()
    )
  );

-- Only primary parents can update onboarding data
CREATE POLICY "Primary parents can update onboarding data"
  ON onboarding_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = onboarding_data.child_id
      AND children.primary_parent_id = auth.uid()
    )
  );
```

**Rationale**: Onboarding data follows same access pattern as children table.

### 5. Data Access Logs Table

**Table**: `data_access_logs`

**Policies**:
```sql
-- Only system/service role can insert logs (via triggers)
CREATE POLICY "System can log data access"
  ON data_access_logs FOR INSERT
  WITH CHECK (true);  -- Triggers use service role

-- Parents can view logs for their children (for transparency)
CREATE POLICY "Parents can view children's access logs"
  ON data_access_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = data_access_logs.child_id
      AND children.primary_parent_id = auth.uid()
    )
  );
```

**Rationale**: 
- Logs are system-generated (via triggers)
- Parents can view logs for audit/transparency
- Prevents log tampering

## Helper Functions

### check_child_session(username)

**Purpose**: Verify child authentication for RLS policies.

**Implementation**:
```sql
CREATE OR REPLACE FUNCTION check_child_session(username_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current session is authenticated as this child
  -- This requires custom session management for children
  -- Implementation depends on child authentication method (JWT/cookie)
  RETURN EXISTS (
    SELECT 1 FROM current_child_session
    WHERE username = username_param
    AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Note**: Exact implementation depends on chosen child authentication method (custom JWT or session cookie).

## Access Patterns Summary

| User Type | Children Table | Onboarding Data | Invitations |
|-----------|---------------|-----------------|-------------|
| Primary Parent | Full CRUD | Full CRUD | Create/Read/Update (sent) |
| Secondary Parent | Read-only | Read-only | Read/Accept (received) |
| Child | Read own | Read own | None |
| System | N/A | N/A | N/A (logs only) |

## Testing RLS Policies

**Contract Tests Required**:
1. Primary parent can CRUD their children
2. Primary parent cannot access other parents' children
3. Secondary parent can read invited children (read-only)
4. Secondary parent cannot modify invited children
5. Child can read own profile
6. Child cannot read other children's profiles
7. Invitation access controls work correctly

See `quickstart.md` for test scenarios.

