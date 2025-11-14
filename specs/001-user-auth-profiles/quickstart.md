# Quickstart Guide: User Authentication & Profile Management

**Feature**: 001-user-auth-profiles  
**Date**: 2025-11-14

## Key Validation Scenarios

### Scenario 1: Parent Account Creation & First Child Setup

**Goal**: Validate complete parent signup and child profile creation flow.

**Steps**:
1. Parent visits app, clicks "Sign Up"
2. Parent creates account with email/password (or social login)
3. Parent is redirected to dashboard
4. Parent sees "Add Your First Child" prompt
5. Parent enters: name, age (10), grade (5), username, password
6. System creates child profile linked to parent
7. Parent is shown child's login credentials
8. Child can now log in with username/password

**Validation**:
- ✅ Parent account created in `auth.users` and `parents` table
- ✅ Child profile created in `children` table with `primary_parent_id`
- ✅ Child password hashed with bcrypt
- ✅ RLS policies allow parent to view child
- ✅ Child can authenticate with username/password

### Scenario 2: Child Onboarding Flow

**Goal**: Validate child completes onboarding after profile creation.

**Steps**:
1. Child logs in with parent-created credentials
2. Child sees welcome screen (if onboarding not completed)
3. Child completes reading interest survey (genres, topics)
4. Child creates and customizes avatar
5. Child sets initial reading goal (optional)
6. Onboarding marked complete
7. Child redirected to dashboard

**Validation**:
- ✅ Onboarding data saved to `onboarding_data` table
- ✅ `children.onboarding_completed` set to `true`
- ✅ Child preferences stored in `reading_preferences` JSONB
- ✅ Avatar data stored in `avatar_data` JSONB

### Scenario 3: Parent Invitation System

**Goal**: Validate secondary parent invitation and acceptance.

**Steps**:
1. Primary parent navigates to child's profile
2. Primary parent clicks "Invite Another Parent"
3. Primary parent enters secondary parent's email
4. System generates invitation token, sends email
5. Secondary parent receives email, clicks acceptance link
6. Secondary parent creates account (if needed) or logs in
7. Secondary parent accepts invitation
8. Secondary parent can now view child's progress (read-only)

**Validation**:
- ✅ Invitation created in `parent_invitations` table
- ✅ Token is unique and secure
- ✅ Email sent with acceptance link
- ✅ Secondary parent can view invitation
- ✅ Acceptance updates invitation status
- ✅ Secondary parent can read child data (RLS allows)
- ✅ Secondary parent cannot modify child data (RLS blocks)

### Scenario 4: Child Password Reset (Parent-Initiated)

**Goal**: Validate parent can reset child password, child cannot self-reset.

**Steps**:
1. Parent logs into dashboard
2. Parent navigates to child's profile settings
3. Parent clicks "Reset Password"
4. Parent enters new password
5. System updates child's password hash
6. Child's old session invalidated
7. Child must log in with new password

**Validation**:
- ✅ Only primary parent can reset (RLS enforces)
- ✅ Password hash updated in database
- ✅ Child cannot access password reset endpoint
- ✅ Old child session invalidated

### Scenario 5: RLS Policy Enforcement

**Goal**: Validate Row Level Security prevents unauthorized access.

**Test Cases**:
1. **Parent A cannot access Parent B's children**
   - Parent A queries `children` table
   - Only Parent A's children returned
   - Parent B's children not visible

2. **Secondary parent read-only access**
   - Secondary parent attempts to update child profile
   - RLS policy blocks UPDATE operation
   - Error: "Only primary parent can update"

3. **Child cannot access other children**
   - Child A logs in, queries `children` table
   - Only Child A's own profile returned
   - Other children not visible

**Validation**:
- ✅ All RLS policies working correctly
- ✅ Unauthorized access attempts blocked
- ✅ Appropriate error messages returned

## Testing Workflows

### Contract Tests

**Location**: `tests/contract/`

**Files**:
- `auth.test.ts` - Authentication endpoint contracts
- `api.test.ts` - API endpoint contracts

**Key Tests**:
- Parent signup returns 201 with parent object
- Parent login returns 200 with session
- Child login returns 200 with session
- Invalid credentials return 401
- Child creation returns 201 with child object
- Username uniqueness enforced (400 if duplicate)

### Integration Tests

**Location**: `tests/integration/`

**Files**:
- `parent-child-flow.test.ts` - Complete parent/child lifecycle
- `rls-policies.test.ts` - RLS policy enforcement
- `invitation-flow.test.ts` - Parent invitation system

**Key Tests**:
- Parent creates child, child can log in
- Parent invites secondary parent, secondary parent accepts
- RLS prevents cross-parent access
- Password reset flow works end-to-end
- Onboarding completion updates child profile

### End-to-End Tests

**Location**: `tests/e2e/` (Playwright)

**Key Scenarios**:
- Complete parent signup → child creation → child login flow
- Parent invitation acceptance flow
- Child onboarding completion
- Parent dashboard displays children correctly

## Manual Testing Checklist

### Parent Account
- [ ] Can sign up with email/password
- [ ] Can sign up with Google OAuth
- [ ] Can sign up with Apple OAuth
- [ ] Can log in with email/password
- [ ] Can log in with social providers
- [ ] Can reset own password
- [ ] Session persists across page refreshes
- [ ] Can log out

### Child Management
- [ ] Can create child profile
- [ ] Username uniqueness enforced
- [ ] Can view list of children
- [ ] Can view individual child profile
- [ ] Can update child information (primary parent only)
- [ ] Can reset child password (primary parent only)
- [ ] Can delete child profile (primary parent only)
- [ ] Secondary parent cannot modify child

### Child Authentication
- [ ] Child can log in with username/password
- [ ] Child cannot log in with invalid credentials
- [ ] Child session persists
- [ ] Child can log out
- [ ] Child cannot reset own password (blocked)

### Parent Invitations
- [ ] Primary parent can send invitation
- [ ] Invitation email sent
- [ ] Invitation token is unique
- [ ] Invited parent can view invitation
- [ ] Invited parent can accept invitation
- [ ] Invited parent can create account during acceptance
- [ ] Secondary parent gains read-only access
- [ ] Invitation expires after 7 days
- [ ] Primary parent can cancel invitation

### Onboarding
- [ ] Child sees onboarding if not completed
- [ ] Child can complete reading interest survey
- [ ] Child can create avatar
- [ ] Onboarding data saved correctly
- [ ] Onboarding completion flag set
- [ ] Child redirected to dashboard after completion

### Security & Compliance
- [ ] RLS policies prevent unauthorized access
- [ ] Data access logged to `data_access_logs`
- [ ] Child data deletion removes all related data
- [ ] Parent can export child data
- [ ] All passwords hashed (never stored plaintext)

## Performance Benchmarks

**Target Metrics** (from Success Criteria):
- Parent account creation: <5 seconds
- Child profile creation: <3 seconds
- Login authentication: <2 seconds
- Page loads: <2 seconds
- 1000 concurrent authenticated users: No degradation

**Testing**:
- Load test with 1000 concurrent parent logins
- Load test with 1000 concurrent child logins
- Measure RLS policy query performance
- Monitor database connection pool usage

## Common Issues & Solutions

### Issue: Child cannot log in after creation
**Solution**: Verify password hash stored correctly, check authentication endpoint logic

### Issue: Secondary parent cannot view child
**Solution**: Verify invitation status is 'accepted', check RLS policy includes invitation join

### Issue: RLS policy too slow
**Solution**: Add indexes on foreign keys, optimize policy queries, consider materialized views

### Issue: Invitation token not working
**Solution**: Check token expiration, verify email matches exactly, ensure token not already used

