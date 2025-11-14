# Implementation Plan: User Authentication & Profile Management

**Branch**: `001-user-auth-profiles` | **Date**: 2025-11-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-user-auth-profiles/spec.md`

## Summary

Build a parent-as-admin authentication and profile management system for a reading app targeting 4th-6th grade students. Parents create accounts first, then add child profiles with username-based login credentials. The system supports parent accounts with email/password or social login (Google, Apple), child profiles managed by parents, parent invitation system for secondary parents, and COPPA-compliant data access controls. Built on SvelteKit frontend with Supabase backend (PostgreSQL, Auth, Storage) using Row Level Security (RLS) for data isolation.

## Technical Context

**Language/Version**: TypeScript 5.x, JavaScript (ES2022), Svelte 5  
**Primary Dependencies**: SvelteKit, Supabase JS Client, Tailwind CSS, @supabase/auth-helpers-sveltekit  
**Storage**: Supabase PostgreSQL (with RLS policies), Supabase Storage (for avatar assets)  
**Testing**: Vitest, Playwright (e2e), @testing-library/svelte  
**Target Platform**: Web (browser), optimized for tablets (primary) and desktop/mobile  
**Project Type**: Web application (frontend + backend via Supabase)  
**Performance Goals**: Login <2s, account creation <5s, page loads <2s, 1000 concurrent authenticated users  
**Constraints**: COPPA/FERPA compliance, WCAG 2.1 AA accessibility, <2s page loads, parent-controlled child accounts  
**Scale/Scope**: MVP supports 1000+ concurrent users, multiple children per parent, parent invitation system

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase -1: Pre-Implementation Gates

#### Simplicity Gate (Article VII)
- [x] Using ≤3 projects? **YES** - Single SvelteKit app with Supabase backend (counts as 1 project)
- [x] No future-proofing? **YES** - MVP scope only, no speculative features

#### Anti-Abstraction Gate (Article VIII)
- [x] Using framework directly? **YES** - SvelteKit and Supabase used directly, no wrappers
- [x] Single model representation? **YES** - Database schema is source of truth, Svelte stores mirror DB state

#### Integration-First Gate (Article IX)
- [x] Contracts defined? **YES** - Will define REST API contracts and Supabase RLS policies
- [x] Contract tests written? **PENDING** - Will be written in Phase 1

#### Test-First Imperative (Article III)
- [x] TDD approach planned? **YES** - Tests written before implementation, Red-Green-Refactor cycle
- [x] Integration tests required? **YES** - Authentication flows, RLS policies, parent-child relationships

#### Privacy and COPPA Compliance (Article III - Constitution)
- [x] Parent-as-admin model? **YES** - Parents create and manage all child accounts
- [x] RLS policies planned? **YES** - All child data tables will have RLS enforcing parent access only
- [x] Data access logging? **YES** - All authentication and data access events logged

#### Platform Integration (Article VII - Constitution)
- [x] Using Supabase Auth? **YES** - Leveraging existing Max Potential platform infrastructure
- [x] Using SvelteKit? **YES** - Consistent with existing platform stack

**Gate Status**: ✅ **PASS** - All gates satisfied. Ready for Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth-profiles/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api-spec.json    # OpenAPI specification
│   └── rls-policies.md  # Row Level Security policy definitions
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.svelte
│   │   │   ├── SignupForm.svelte
│   │   │   ├── SocialLogin.svelte
│   │   │   └── PasswordReset.svelte
│   │   ├── parent/
│   │   │   ├── AddChildForm.svelte
│   │   │   ├── ChildProfileCard.svelte
│   │   │   ├── ParentInviteForm.svelte
│   │   │   └── ParentDashboard.svelte
│   │   ├── child/
│   │   │   ├── OnboardingFlow.svelte
│   │   │   ├── ReadingInterestSurvey.svelte
│   │   │   ├── AvatarCreator.svelte
│   │   │   └── ChildDashboard.svelte
│   │   └── shared/
│   │       ├── ProfileSettings.svelte
│   │       └── SessionManager.svelte
│   ├── routes/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── reset-password/
│   │   ├── (parent)/
│   │   │   ├── dashboard/
│   │   │   ├── children/
│   │   │   │   ├── [childId]/
│   │   │   │   └── +page.svelte
│   │   │   └── invitations/
│   │   └── (child)/
│   │       ├── dashboard/
│   │       ├── onboarding/
│   │       └── profile/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── types.ts
│   │   ├── stores/
│   │   │   ├── auth.ts
│   │   │   ├── parent.ts
│   │   │   └── child.ts
│   │   └── utils/
│   │       ├── validation.ts
│   │       └── coppa.ts
│   └── server/
│       └── api/
│           ├── auth/
│           ├── parents/
│           └── children/
├── supabase/
│   ├── migrations/
│   │   ├── 001_create_parents_table.sql
│   │   ├── 002_create_children_table.sql
│   │   ├── 003_create_parent_invitations_table.sql
│   │   ├── 004_create_onboarding_data_table.sql
│   │   └── 005_setup_rls_policies.sql
│   └── seed.sql
└── tests/
    ├── contract/
    │   ├── auth.test.ts
    │   └── api.test.ts
    ├── integration/
    │   ├── parent-child-flow.test.ts
    │   ├── rls-policies.test.ts
    │   └── invitation-flow.test.ts
    └── unit/
        ├── validation.test.ts
        └── stores.test.ts
```

**Structure Decision**: Web application structure with SvelteKit frontend and Supabase backend. Frontend routes organized by user type (auth, parent, child) with shared components. Database migrations in `supabase/migrations/` following Supabase conventions. Tests organized by type (contract, integration, unit) following TDD principles.

## Complexity Tracking

> **No violations** - All constitution gates passed. Single project structure, direct framework usage, integration-first testing approach.

## Phase 0: Outline & Research

### Research Tasks

1. **Supabase Auth with Custom User Types**
   - How to implement parent vs child user types in Supabase Auth
   - Best practices for username-based authentication (children) vs email-based (parents)
   - Custom claims or metadata for user role differentiation

2. **Row Level Security (RLS) Policies for Parent-Child Relationships**
   - RLS patterns for parent accessing only their children's data
   - RLS for secondary parent read-only access
   - Performance implications of RLS policies

3. **Parent Invitation System Implementation**
   - Email invitation flow patterns
   - Token-based invitation acceptance
   - Handling invitations for non-existent parent accounts

4. **COPPA Compliance Technical Implementation**
   - Data access logging requirements
   - Parent consent tracking
   - Account deletion and data cleanup procedures

5. **SvelteKit + Supabase Integration Patterns**
   - Server-side authentication helpers
   - Client-side auth state management
   - Session persistence and refresh

See `research.md` for detailed findings.

## Phase 1: Design & Contracts

### Data Model

See `data-model.md` for complete entity definitions, relationships, and validation rules.

**Key Entities:**
- `parents` - Parent user accounts (linked to Supabase Auth)
- `children` - Child profiles (username-based auth, linked to parent)
- `parent_invitations` - Secondary parent invitation system
- `onboarding_data` - Child onboarding responses

### API Contracts

See `contracts/api-spec.json` for OpenAPI specification and `contracts/rls-policies.md` for database security policies.

**Key Endpoints:**
- `POST /api/auth/parent/signup` - Parent account creation
- `POST /api/auth/parent/login` - Parent login
- `POST /api/auth/child/login` - Child username/password login
- `POST /api/parents/children` - Create child profile
- `GET /api/parents/children` - List parent's children
- `POST /api/parents/invitations` - Invite secondary parent
- `PUT /api/parents/children/[id]/password` - Reset child password

### Quickstart Guide

See `quickstart.md` for key validation scenarios and testing workflows.

## Phase 2: Implementation Planning

*This phase is handled by `/speckit.tasks` command - not part of `/speckit.plan`*

The implementation will be broken down into tasks organized by:
1. Database schema and migrations
2. RLS policy implementation
3. Authentication flows (parent and child)
4. Parent dashboard and child management
5. Child onboarding flow
6. Parent invitation system
7. Testing (contract, integration, unit)
