# Tasks: User Authentication & Profile Management

**Input**: Design documents from `/specs/001-user-auth-profiles/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: TDD approach required per constitution - tests written before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create SvelteKit project structure per implementation plan in repository root
- [x] T002 Initialize SvelteKit project with TypeScript, Tailwind CSS, and Supabase dependencies
- [x] T003 [P] Configure ESLint, Prettier, and TypeScript settings in project root
- [x] T004 [P] Setup Supabase project and configure environment variables (.env files)
- [x] T005 [P] Initialize Supabase migrations directory at supabase/migrations/
- [x] T006 [P] Setup testing framework (Vitest, Playwright) configuration files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create database migration for parents table in supabase/migrations/001_create_parents_table.sql
- [x] T008 Create database migration for children table in supabase/migrations/002_create_children_table.sql
- [x] T009 Create database migration for parent_invitations table in supabase/migrations/003_create_parent_invitations_table.sql
- [x] T010 Create database migration for onboarding_data table in supabase/migrations/004_create_onboarding_data_table.sql
- [x] T011 Create database migration for data_access_logs table in supabase/migrations/005_create_data_access_logs_table.sql
- [x] T012 Create database migration for indexes in supabase/migrations/006_create_indexes.sql
- [x] T013 Create database migration for RLS policies in supabase/migrations/007_setup_rls_policies.sql
- [x] T014 Create database trigger for data access logging in supabase/migrations/008_create_access_log_triggers.sql
- [x] T015 [P] Create Supabase client utilities in src/lib/supabase/client.ts
- [x] T016 [P] Create Supabase server utilities in src/lib/supabase/server.ts
- [x] T017 [P] Generate TypeScript types from Supabase schema in src/lib/supabase/types.ts
- [x] T018 [P] Create authentication store in src/lib/stores/auth.ts
- [x] T019 [P] Create parent store in src/lib/stores/parent.ts
- [x] T020 [P] Create child store in src/lib/stores/child.ts
- [x] T021 [P] Create validation utilities in src/lib/utils/validation.ts
- [x] T022 [P] Create COPPA compliance utilities in src/lib/utils/coppa.ts
- [x] T023 Setup error handling and logging infrastructure in src/lib/utils/errors.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 3 - User Login & Session Management (Priority: P1)

**Goal**: Implement secure login and session management for both parents and children, enabling all authenticated features.

**Independent Test**: Can be fully tested by logging in with valid credentials (parent email/password, child username/password), verifying session persists across page refreshes, and successfully logging out. The test validates authentication, session management, and security without requiring any other features.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T024 [P] [US3] Contract test for parent login endpoint in tests/contract/auth-parent.test.ts
- [x] T025 [P] [US3] Contract test for child login endpoint in tests/contract/auth-child.test.ts
- [x] T026 [P] [US3] Integration test for parent login flow in tests/integration/auth-parent-flow.test.ts
- [x] T027 [P] [US3] Integration test for child login flow in tests/integration/auth-child-flow.test.ts
- [x] T028 [P] [US3] Integration test for session persistence in tests/integration/session-persistence.test.ts
- [x] T029 [P] [US3] Integration test for logout in tests/integration/logout.test.ts

### Implementation for User Story 3

- [x] T030 [US3] Implement parent login API endpoint in src/routes/api/auth/parent/login/+server.ts
- [x] T031 [US3] Implement child login API endpoint in src/routes/api/auth/child/login/+server.ts
- [x] T032 [US3] Implement logout API endpoint in src/routes/api/auth/logout/+server.ts
- [x] T033 [US3] Create parent login form component in src/lib/components/auth/LoginForm.svelte
- [x] T034 [US3] Create child login form component in src/lib/components/auth/ChildLoginForm.svelte
- [x] T035 [US3] Create login page route in src/routes/(auth)/login/+page.svelte
- [x] T036 [US3] Implement session management middleware in src/lib/middleware/session.ts
- [x] T037 [US3] Implement password hashing utility for children in src/lib/utils/password.ts
- [x] T038 [US3] Add error handling and validation for login forms
- [x] T039 [US3] Add logging for authentication events

**Checkpoint**: At this point, User Story 3 should be fully functional - users can log in and maintain sessions

---

## Phase 4: User Story 1 - Parent Account Creation & Child Addition (Priority: P1) 🎯 MVP

**Goal**: Enable parents to create accounts, add child profiles, and complete child onboarding setup. This is the foundational entry point for the entire app.

**Independent Test**: Can be fully tested by having a parent create an account (email/password or social login), add a child profile, and complete the child's onboarding, resulting in a complete parent account with linked child profile ready to use the app. The test validates parent authentication, child profile creation, COPPA compliance, and profile data persistence.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T040 [P] [US1] Contract test for parent signup endpoint in tests/contract/auth-signup.test.ts
- [x] T041 [P] [US1] Contract test for create child endpoint in tests/contract/children-create.test.ts
- [x] T042 [P] [US1] Integration test for parent signup flow in tests/integration/parent-signup-flow.test.ts
- [x] T043 [P] [US1] Integration test for child creation flow in tests/integration/child-creation-flow.test.ts
- [x] T044 [P] [US1] Integration test for onboarding completion in tests/integration/onboarding-flow.test.ts
- [x] T045 [P] [US1] Integration test for RLS policies on child data in tests/integration/rls-children.test.ts

### Implementation for User Story 1

- [x] T046 [US1] Implement parent signup API endpoint in src/routes/api/auth/parent/signup/+server.ts
- [x] T047 [US1] Implement create parent profile function in src/lib/server/api/parents/create.ts
- [x] T048 [US1] Implement create child API endpoint in src/routes/api/parents/children/+server.ts
- [x] T049 [US1] Implement create child profile function in src/lib/server/api/children/create.ts
- [x] T050 [US1] Implement username uniqueness validation in src/lib/utils/validation.ts
- [x] T051 [US1] Create parent signup form component in src/lib/components/auth/SignupForm.svelte
- [x] T052 [US1] Create social login component in src/lib/components/auth/SocialLogin.svelte
- [x] T053 [US1] Create signup page route in src/routes/(auth)/signup/+page.svelte
- [x] T054 [US1] Create add child form component in src/lib/components/parent/AddChildForm.svelte
- [x] T055 [US1] Create parent dashboard component in src/lib/components/parent/ParentDashboard.svelte
- [x] T056 [US1] Create parent dashboard page route in src/routes/(parent)/dashboard/+page.svelte
- [x] T057 [US1] Create child onboarding flow component in src/lib/components/child/OnboardingFlow.svelte
- [x] T058 [US1] Create reading interest survey component in src/lib/components/child/ReadingInterestSurvey.svelte
- [x] T059 [US1] Create avatar creator component in src/lib/components/child/AvatarCreator.svelte
- [x] T060 [US1] Create onboarding page route in src/routes/(child)/onboarding/+page.svelte
- [x] T061 [US1] Implement save onboarding data function in src/lib/server/api/onboarding/save.ts
- [x] T062 [US1] Implement onboarding completion API endpoint in src/routes/api/onboarding/complete/+server.ts
- [x] T063 [US1] Add parent guidance flow for first child addition
- [x] T064 [US1] Add validation for child profile creation (age, grade, username)
- [x] T065 [US1] Add logging for child profile creation events

**Checkpoint**: At this point, User Story 1 should be fully functional - parents can create accounts, add children, and children can complete onboarding

---

## Phase 5: User Story 2 - Student Login & Profile Access (Priority: P1)

**Goal**: Enable children to log in independently using parent-created credentials and access their personalized dashboard and profile.

**Independent Test**: Can be fully tested by having a child (with profile created in US1) log in with parent-created credentials, access their dashboard, and verify they can see their profile, reading progress, and app features. The test validates child authentication, profile access, and data permissions.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T066 [P] [US2] Integration test for child login and dashboard access in tests/integration/child-dashboard-flow.test.ts
- [x] T067 [P] [US2] Integration test for child profile access in tests/integration/child-profile-access.test.ts
- [x] T068 [P] [US2] Integration test for child preference updates in tests/integration/child-preferences.test.ts
- [x] T069 [P] [US2] Integration test for child password change restriction in tests/integration/child-password-restriction.test.ts

### Implementation for User Story 2

- [x] T070 [US2] Create child dashboard component in src/lib/components/child/ChildDashboard.svelte
- [x] T071 [US2] Create child dashboard page route in src/routes/(child)/dashboard/+page.svelte
- [x] T072 [US2] Create child profile view component in src/lib/components/child/ChildProfileView.svelte
- [x] T073 [US2] Create child profile page route in src/routes/(child)/profile/+page.svelte
- [x] T074 [US2] Implement get child profile API endpoint in src/routes/api/children/[childId]/+server.ts
- [x] T075 [US2] Implement update child preferences function in src/lib/server/api/children/update-preferences.ts
- [x] T076 [US2] Implement update child preferences API endpoint in src/routes/api/children/[childId]/preferences/+server.ts
- [x] T077 [US2] Implement update child avatar function in src/lib/server/api/children/update-avatar.ts
- [x] T078 [US2] Implement update child avatar API endpoint in src/routes/api/children/[childId]/avatar/+server.ts
- [x] T079 [US2] Add child session management for username-based authentication
- [x] T080 [US2] Add child dashboard data loading (reading progress, achievements, recommendations placeholders)
- [x] T081 [US2] Add validation that children cannot access password reset endpoints
- [x] T082 [US2] Add logging for child profile access events

**Checkpoint**: At this point, User Story 2 should be fully functional - children can log in and access their profiles independently

---

## Phase 6: Parent Invitation System (Secondary Parents)

**Goal**: Enable primary parents to invite secondary parents for read-only access to their children's profiles.

**Independent Test**: Can be fully tested by having a primary parent send an invitation, secondary parent accept it, and verify secondary parent has read-only access to child data.

### Tests for Parent Invitations ⚠️

- [x] T083 [P] Contract test for send invitation endpoint in tests/contract/invitations-send.test.ts
- [x] T084 [P] Contract test for accept invitation endpoint in tests/contract/invitations-accept.test.ts
- [x] T085 [P] Integration test for invitation flow in tests/integration/invitation-flow.test.ts
- [x] T086 [P] Integration test for secondary parent read-only access in tests/integration/secondary-parent-access.test.ts

### Implementation for Parent Invitations

- [x] T087 Implement send invitation API endpoint in src/routes/api/parents/invitations/+server.ts
- [x] T088 Implement generate invitation token function in src/lib/server/api/invitations/generate-token.ts
- [x] T089 Implement send invitation email function in src/lib/server/api/invitations/send-email.ts
- [x] T090 Implement accept invitation API endpoint in src/routes/api/parents/invitations/[token]/accept/+server.ts
- [x] T091 Create parent invitation form component in src/lib/components/parent/ParentInviteForm.svelte
- [x] T092 Create invitation acceptance page route in src/routes/(auth)/invitations/[token]/+page.svelte
- [x] T093 Implement invitation expiration check (7 days)
- [x] T094 Add RLS policy for secondary parent read-only access
- [x] T095 Add validation that secondary parents cannot modify child data

---

## Phase 7: Parent Password Reset & Child Password Management

**Goal**: Enable parents to reset their own passwords and manage their children's passwords.

**Independent Test**: Can be fully tested by having a parent reset their password via email, and having a primary parent reset a child's password through the dashboard.

### Tests for Password Management ⚠️

- [x] T096 [P] Contract test for parent password reset endpoint in tests/contract/password-reset-parent.test.ts
- [x] T097 [P] Contract test for child password reset endpoint in tests/contract/password-reset-child.test.ts
- [x] T098 [P] Integration test for parent password reset flow in tests/integration/password-reset-parent.test.ts
- [x] T099 [P] Integration test for child password reset flow in tests/integration/password-reset-child.test.ts

### Implementation for Password Management

- [x] T100 Implement parent password reset request API endpoint in src/routes/api/auth/parent/reset-password/+server.ts
- [x] T101 Implement send password reset email function in src/lib/server/api/auth/send-reset-email.ts
- [x] T102 Implement parent password reset confirmation API endpoint in src/routes/api/auth/parent/reset-password/confirm/+server.ts
- [x] T103 Implement child password reset API endpoint in src/routes/api/parents/children/[childId]/password/+server.ts
- [x] T104 Create password reset request form component in src/lib/components/auth/PasswordReset.svelte
- [x] T105 Create password reset confirmation page route in src/routes/(auth)/reset-password/[token]/+page.svelte
- [x] T106 Add validation that children cannot self-initiate password resets
- [x] T107 Add password reset token expiration (2 hours for parents)

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T108 [P] Add comprehensive error handling across all API endpoints
- [x] T109 [P] Add loading states and user feedback for all forms
- [x] T110 [P] Implement accessibility features (WCAG 2.1 AA) in all components
- [x] T111 [P] Add responsive design for tablet and mobile devices
- [x] T112 [P] Add data export functionality for COPPA compliance in src/lib/server/api/children/export-data.ts
- [x] T113 [P] Implement account deletion with data cleanup in src/lib/server/api/accounts/delete.ts
- [x] T114 [P] Add comprehensive logging for all data access events
- [x] T115 [P] Performance optimization: Add database query optimization and caching where needed
- [x] T116 [P] Security hardening: Review and test all RLS policies
- [ ] T117 [P] Run quickstart.md validation scenarios
- [x] T118 [P] Update documentation in README.md and API documentation
- [x] T119 [P] Code cleanup and refactoring for consistency

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Story 3 (Phase 3)**: Depends on Foundational completion - Provides authentication infrastructure
- **User Story 1 (Phase 4)**: Depends on Foundational + US3 completion - Needs auth to create parent accounts
- **User Story 2 (Phase 5)**: Depends on US1 completion - Needs child profiles to exist before children can log in
- **Parent Invitations (Phase 6)**: Depends on US1 completion - Needs children and parents to exist
- **Password Management (Phase 7)**: Depends on US3 completion - Needs authentication system
- **Polish (Phase 8)**: Depends on all desired features being complete

### User Story Dependencies

- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 1 (P1)**: Can start after Foundational + US3 - Needs authentication to create parent accounts
- **User Story 2 (P1)**: Can start after US1 - Needs child profiles created by parents

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Database migrations before API endpoints
- API endpoints before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members (after dependencies met)
- Models and utilities marked [P] can be created in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Contract test for parent signup endpoint in tests/contract/auth-signup.test.ts"
Task: "Contract test for create child endpoint in tests/contract/children-create.test.ts"
Task: "Integration test for parent signup flow in tests/integration/parent-signup-flow.test.ts"
Task: "Integration test for child creation flow in tests/integration/child-creation-flow.test.ts"

# Launch all components for User Story 1 together (after API endpoints):
Task: "Create parent signup form component in src/lib/components/auth/SignupForm.svelte"
Task: "Create social login component in src/lib/components/auth/SocialLogin.svelte"
Task: "Create add child form component in src/lib/components/parent/AddChildForm.svelte"
Task: "Create reading interest survey component in src/lib/components/child/ReadingInterestSurvey.svelte"
Task: "Create avatar creator component in src/lib/components/child/AvatarCreator.svelte"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 3 (Login & Session)
4. Complete Phase 4: User Story 1 (Parent Account & Child Addition)
5. Complete Phase 5: User Story 2 (Child Login & Profile Access)
6. **STOP and VALIDATE**: Test all three user stories independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 3 → Test independently → Deploy/Demo (Authentication working)
3. Add User Story 1 → Test independently → Deploy/Demo (Parents can create accounts and children)
4. Add User Story 2 → Test independently → Deploy/Demo (Children can log in)
5. Add Parent Invitations → Test independently → Deploy/Demo
6. Add Password Management → Test independently → Deploy/Demo
7. Polish phase → Final release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 3 (Login & Session)
   - Developer B: Prepares for User Story 1 (studies requirements)
3. Once US3 is done:
   - Developer A: User Story 1 (Parent Account & Child Addition)
   - Developer B: User Story 2 (Child Login - can start after US1 child creation works)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All child password operations must be parent-initiated (COPPA compliance)
- RLS policies must be tested thoroughly - they enforce data security

