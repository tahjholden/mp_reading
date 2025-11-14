# Research: User Authentication & Profile Management

**Feature**: 001-user-auth-profiles  
**Date**: 2025-11-14

## Research Findings

### 1. Supabase Auth with Custom User Types

**Decision**: Use Supabase Auth `auth.users` table for parent accounts (email-based), and custom `children` table with username/password for child accounts. Use Supabase Auth metadata to store user type.

**Rationale**: 
- Supabase Auth handles email/password and OAuth for parents seamlessly
- Children need username-based login (no email requirement), so custom authentication table is needed
- Store child passwords using bcrypt (via Supabase Edge Function or application layer)
- Use `auth.users.raw_user_meta_data` to store `user_type: 'parent'` for parent accounts
- Children authenticate via custom endpoint that validates against `children` table

**Alternatives Considered**:
- Single Supabase Auth table for both: Rejected - children don't have emails, would require workarounds
- Separate Supabase projects: Rejected - adds complexity, violates simplicity principle
- Third-party auth service: Rejected - adds dependency, Supabase Auth is sufficient

**Implementation Notes**:
- Parent accounts: Standard Supabase Auth signup/login
- Child accounts: Custom login endpoint that queries `children` table, validates password hash
- Session management: Use Supabase session for parents, custom JWT or session for children
- Consider using Supabase Auth's `service_role` key for child authentication (server-side only)

### 2. Row Level Security (RLS) Policies for Parent-Child Relationships

**Decision**: Implement RLS policies on all child-related tables that check parent ownership via foreign key relationships.

**Rationale**:
- RLS policies enforce data access at the database level, providing defense-in-depth
- Policies check `parent_id` foreign key to ensure parents only access their own children
- Secondary parents access via `parent_invitations` join table with read-only flag
- All policies use `auth.uid()` for parent accounts, custom function for child accounts

**Policy Patterns**:
```sql
-- Example: Children table RLS
CREATE POLICY "Parents can view their own children"
  ON children FOR SELECT
  USING (
    primary_parent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM parent_invitations
      WHERE child_id = children.id
      AND parent_id = auth.uid()
      AND status = 'accepted'
    )
  );

-- Parents can only update their primary children
CREATE POLICY "Primary parents can update their children"
  ON children FOR UPDATE
  USING (primary_parent_id = auth.uid());
```

**Alternatives Considered**:
- Application-level access control only: Rejected - violates defense-in-depth, RLS is required by constitution
- Separate databases per parent: Rejected - impractical, violates simplicity

**Performance Considerations**:
- RLS policies add minimal overhead (<10ms) for single-row queries
- Index foreign keys (`primary_parent_id`, `parent_id` in invitations) for performance
- Use materialized views for complex parent dashboard queries if needed

### 3. Parent Invitation System Implementation

**Decision**: Token-based email invitation system with invitation table tracking status.

**Rationale**:
- Email invitations are standard pattern, familiar to users
- Token-based system is secure and doesn't require pre-existing accounts
- Invitation table tracks: child_id, invited_email, token, status (pending/accepted/rejected), expires_at
- Invited parent can accept even if they don't have an account yet (creates account during acceptance)

**Flow**:
1. Primary parent sends invitation via email
2. System generates secure token, stores in `parent_invitations` table
3. Email sent with acceptance link containing token
4. Invited parent clicks link, creates account if needed, accepts invitation
5. System links parent to child with read-only access flag

**Alternatives Considered**:
- QR code invitations: Rejected - less convenient, requires in-person sharing
- Manual account linking: Rejected - no verification mechanism, security risk
- Admin approval: Rejected - adds friction, parent-as-admin model doesn't need it

**Implementation Notes**:
- Token expiration: 7 days
- One-time use tokens (delete after acceptance)
- Email templates: Clear, parent-friendly language
- Handle edge case: Invited parent already has account with that email

### 4. COPPA Compliance Technical Implementation

**Decision**: Comprehensive logging, parent consent tracking, and automated data cleanup procedures.

**Rationale**:
- COPPA requires explicit parent consent and data access controls
- Parent-as-admin model provides consent through account creation
- All child data access must be logged for audit
- Account deletion must remove all child data per COPPA right to deletion

**Implementation Requirements**:
- **Consent Tracking**: Record parent consent timestamp when child profile created
- **Access Logging**: Log all reads/writes to child data tables (use Supabase triggers or application logging)
- **Data Deletion**: Cascade delete all child-related data when parent deletes child profile
- **Data Export**: Provide parent ability to export all child data (COPPA requirement)

**Logging Strategy**:
- Create `data_access_logs` table tracking: user_id, child_id, action, timestamp, ip_address
- Use Supabase database triggers to auto-log all child table modifications
- Store logs for minimum 1 year (COPPA requirement)

**Alternatives Considered**:
- External logging service: Rejected - adds dependency, Supabase sufficient
- No logging: Rejected - violates COPPA compliance requirements

### 5. SvelteKit + Supabase Integration Patterns

**Decision**: Use `@supabase/auth-helpers-sveltekit` for server-side auth, Svelte stores for client-side state.

**Rationale**:
- Official Supabase helpers provide best integration patterns
- Server-side auth helpers ensure secure session management
- Svelte stores provide reactive state management for UI
- Follows SvelteKit conventions for server/client data flow

**Pattern**:
```typescript
// Server-side (load functions)
import { createServerClient } from '@supabase/auth-helpers-sveltekit'

// Client-side (components)
import { createClient } from '@supabase/supabase-js'
import { authStore } from '$lib/stores/auth'
```

**Session Management**:
- Use Supabase session cookies (handled by auth helpers)
- Refresh tokens automatically via Supabase client
- Child sessions: Custom JWT or session stored in httpOnly cookie

**Alternatives Considered**:
- Custom auth implementation: Rejected - reinventing wheel, violates framework trust
- Client-only auth: Rejected - security risk, violates best practices

## Summary

All research areas resolved. Implementation approach:
- Supabase Auth for parents, custom table for children
- RLS policies for all child data access
- Token-based parent invitation system
- Comprehensive COPPA compliance logging and data management
- Standard SvelteKit + Supabase integration patterns

No blocking issues identified. Ready for Phase 1 design.

