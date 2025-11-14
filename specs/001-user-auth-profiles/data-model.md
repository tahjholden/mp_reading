# Data Model: User Authentication & Profile Management

**Feature**: 001-user-auth-profiles  
**Date**: 2025-11-14

## Overview

The data model supports a parent-as-admin authentication system where parents create and manage child profiles. Parents use Supabase Auth (email-based), children use username-based authentication stored in custom tables.

## Entities

### 1. Parents

**Table**: `parents`  
**Auth**: Supabase Auth (`auth.users`)

**Description**: Parent user accounts that administer their children's profiles.

**Fields**:
- `id` (UUID, PK) - References `auth.users.id`
- `email` (TEXT, UNIQUE, NOT NULL) - Parent email (from auth.users)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())
- `notification_preferences` (JSONB) - Email notification settings
- `metadata` (JSONB) - Additional parent profile data

**Relationships**:
- One-to-many with `children` (via `primary_parent_id`)
- Many-to-many with `children` via `parent_invitations` (secondary parents)

**Validation Rules**:
- Email must be valid format
- Email must be unique across all parent accounts

**State Transitions**: N/A (account created/deleted only)

### 2. Children

**Table**: `children`  
**Auth**: Custom (username/password in this table)

**Description**: Child profiles created and managed by parents.

**Fields**:
- `id` (UUID, PK, DEFAULT uuid_generate_v4())
- `primary_parent_id` (UUID, FK → `parents.id`, NOT NULL)
- `username` (TEXT, UNIQUE, NOT NULL) - Login username
- `password_hash` (TEXT, NOT NULL) - Bcrypt hashed password
- `name` (TEXT, NOT NULL) - Child's name
- `age` (INTEGER, CHECK age BETWEEN 9 AND 12) - Child's age
- `grade_level` (INTEGER, CHECK grade_level IN (4, 5, 6)) - 4th, 5th, or 6th grade
- `email` (TEXT, NULLABLE) - Optional email (parent's or child's)
- `reading_preferences` (JSONB) - Genres, topics, challenge level
- `avatar_data` (JSONB) - Avatar customization data
- `reading_level` (INTEGER, NULLABLE) - Lexile score or reading level
- `onboarding_completed` (BOOLEAN, DEFAULT FALSE)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

**Relationships**:
- Many-to-one with `parents` (primary parent)
- Many-to-many with `parents` via `parent_invitations` (secondary parents)
- One-to-one with `onboarding_data`

**Validation Rules**:
- Username must be unique across all children
- Username: 3-20 characters, alphanumeric and underscores only
- Password: Minimum 8 characters (enforced at application level)
- Age must be between 9-12
- Grade level must be 4, 5, or 6
- Email format validation if provided

**State Transitions**:
- `onboarding_completed`: false → true (one-time, when onboarding finished)

**Indexes**:
- `idx_children_username` (UNIQUE) on `username`
- `idx_children_primary_parent` on `primary_parent_id`
- `idx_children_email` on `email` (where email IS NOT NULL)

### 3. Parent Invitations

**Table**: `parent_invitations`

**Description**: Tracks invitations from primary parents to secondary parents for shared child access.

**Fields**:
- `id` (UUID, PK, DEFAULT uuid_generate_v4())
- `child_id` (UUID, FK → `children.id`, NOT NULL)
- `invited_email` (TEXT, NOT NULL) - Email of invited parent
- `invited_by_parent_id` (UUID, FK → `parents.id`, NOT NULL) - Primary parent who sent invitation
- `token` (TEXT, UNIQUE, NOT NULL) - Secure invitation token
- `status` (TEXT, CHECK status IN ('pending', 'accepted', 'rejected', 'expired'), DEFAULT 'pending')
- `expires_at` (TIMESTAMPTZ, NOT NULL) - Token expiration (7 days from creation)
- `accepted_at` (TIMESTAMPTZ, NULLABLE)
- `accepted_by_parent_id` (UUID, FK → `parents.id`, NULLABLE) - Parent who accepted
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

**Relationships**:
- Many-to-one with `children`
- Many-to-one with `parents` (inviter)
- Many-to-one with `parents` (accepter, nullable)

**Validation Rules**:
- Token must be unique
- Token must be cryptographically secure (32+ random bytes)
- Expires_at must be in the future
- Status transitions: pending → accepted/rejected/expired (one-way)

**State Transitions**:
- `status`: pending → accepted (when invitation accepted)
- `status`: pending → rejected (when invitation rejected)
- `status`: pending → expired (when expires_at passed)

**Indexes**:
- `idx_invitations_token` (UNIQUE) on `token`
- `idx_invitations_child` on `child_id`
- `idx_invitations_email` on `invited_email`
- `idx_invitations_status` on `status`

### 4. Onboarding Data

**Table**: `onboarding_data`

**Description**: Stores child onboarding responses (reading interest survey, avatar choices, initial goals).

**Fields**:
- `id` (UUID, PK, DEFAULT uuid_generate_v4())
- `child_id` (UUID, FK → `children.id`, UNIQUE, NOT NULL)
- `reading_interest_survey` (JSONB, NOT NULL) - Survey responses (genres, topics, formats)
- `avatar_choices` (JSONB, NOT NULL) - Avatar creation data
- `initial_goals` (JSONB, NULLABLE) - Initial reading goals set during onboarding
- `completed_at` (TIMESTAMPTZ, DEFAULT NOW())

**Relationships**:
- One-to-one with `children`

**Validation Rules**:
- `child_id` must be unique (one onboarding per child)
- Survey must contain required fields (validated at application level)

**State Transitions**: N/A (created once, not modified)

### 5. Data Access Logs

**Table**: `data_access_logs`

**Description**: Audit log for COPPA compliance - tracks all access to child data.

**Fields**:
- `id` (UUID, PK, DEFAULT uuid_generate_v4())
- `user_id` (UUID, NULLABLE) - Parent user ID (if parent access)
- `child_id` (UUID, FK → `children.id`, NOT NULL)
- `action` (TEXT, NOT NULL) - 'read', 'create', 'update', 'delete'
- `table_name` (TEXT, NOT NULL) - Table accessed
- `record_id` (UUID, NULLABLE) - Specific record ID if applicable
- `ip_address` (INET, NULLABLE) - Request IP address
- `user_agent` (TEXT, NULLABLE) - Browser/client info
- `timestamp` (TIMESTAMPTZ, DEFAULT NOW())

**Relationships**:
- Many-to-one with `children`
- Many-to-one with `parents` (nullable, via user_id)

**Validation Rules**:
- Action must be one of: read, create, update, delete
- Timestamp must be current or past

**Indexes**:
- `idx_logs_child` on `child_id`
- `idx_logs_user` on `user_id`
- `idx_logs_timestamp` on `timestamp`
- `idx_logs_action` on `action`

**Retention**: Logs retained for minimum 1 year (COPPA requirement)

## Database Schema

### Supabase Auth Integration

- `auth.users` table: Managed by Supabase Auth
  - Parent accounts stored here
  - `raw_user_meta_data` contains `{ "user_type": "parent" }`
  - Email/password and OAuth providers configured

### Custom Authentication for Children

- Children authenticate via custom endpoint
- Password hashing: bcrypt (cost factor 10)
- Session: Custom JWT or httpOnly cookie

## Row Level Security (RLS)

All tables have RLS enabled. See `contracts/rls-policies.md` for detailed policy definitions.

**General Principles**:
- Parents can only access their own children (primary or via invitation)
- Secondary parents have read-only access
- Children can only access their own profile
- All access logged to `data_access_logs`

## Data Relationships Diagram

```
parents (1) ──< (many) children
  │                      │
  │                      │ (1)
  │                      │
  │                      └──> onboarding_data (1:1)
  │
  └──< (many) parent_invitations >── (many) children
       │
       └──> (many) parents (secondary)
```

## Migration Strategy

1. Create `parents` table (references `auth.users`)
2. Create `children` table
3. Create `parent_invitations` table
4. Create `onboarding_data` table
5. Create `data_access_logs` table
6. Enable RLS on all tables
7. Create RLS policies
8. Create indexes
9. Create database triggers for access logging

## Data Validation

**Application-Level Validation**:
- Username format (3-20 chars, alphanumeric + underscore)
- Password strength (min 8 chars, complexity requirements)
- Email format (when provided)
- Age and grade level ranges
- JSONB structure validation for preferences and avatar data

**Database-Level Constraints**:
- Foreign key constraints
- CHECK constraints for age, grade level, status enums
- UNIQUE constraints on username, email (where applicable)
- NOT NULL constraints on required fields

