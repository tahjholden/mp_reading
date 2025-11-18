# Reading Acceleration App

A reading comprehension and motivation app for 4th-6th grade students, built with SvelteKit and Supabase.

## Overview

This application helps reluctant readers develop reading skills through:
- Adaptive reading library with personalized recommendations
- Interactive reading experience with comprehension support
- Gamification and achievement systems
- Parent and teacher dashboards for progress tracking

## Tech Stack

- **Frontend**: SvelteKit + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Testing**: Vitest, Playwright
- **Deployment**: Vercel (frontend), Supabase (backend)

## Features

### Phase 1: User Authentication & Profile Management ✅

- Parent account creation and authentication
- Child profile creation and management
- Child onboarding flow with reading interest survey
- Avatar creation
- Parent invitation system (secondary parents)
- Password reset functionality
- Data export for COPPA compliance
- Account deletion with data cleanup

### Upcoming Features

- Adaptive Reading Library
- Reading Session Tracking
- Interactive Reading Interface
- Micro-Comprehension Checks
- Recommendation Engine
- Gamification System
- Student/Parent/Teacher Dashboards

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account and project
- Environment variables configured

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mp_reading
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Configure the following variables:
- `PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (server-side only)
- `JWT_SECRET`: Secret for child session tokens

4. Run database migrations:
```bash
# Apply migrations to your Supabase project
# Use Supabase CLI or Supabase dashboard
```

5. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:5173` to see the app.

## Project Structure

```
mp_reading/
├── src/
│   ├── lib/
│   │   ├── components/      # Svelte components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── child/       # Child-specific components
│   │   │   └── parent/      # Parent-specific components
│   │   ├── middleware/      # Session management
│   │   ├── server/          # Server-side utilities
│   │   │   └── api/         # API endpoint handlers
│   │   ├── stores/          # Svelte stores
│   │   ├── supabase/        # Supabase client utilities
│   │   └── utils/           # Utility functions
│   ├── routes/             # SvelteKit routes
│   │   ├── (auth)/          # Authentication routes
│   │   ├── (child)/         # Child routes
│   │   ├── (parent)/        # Parent routes
│   │   └── api/             # API endpoints
│   └── app.css              # Global styles
├── supabase/
│   └── migrations/          # Database migrations
├── tests/                    # Test files
│   ├── contract/             # Contract tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # End-to-end tests
└── specs/                   # Feature specifications
```

## API Endpoints

### Authentication

- `POST /api/auth/parent/signup` - Create parent account
- `POST /api/auth/parent/login` - Parent login
- `POST /api/auth/parent/reset-password` - Request password reset
- `POST /api/auth/parent/reset-password/confirm` - Confirm password reset
- `POST /api/auth/child/login` - Child login
- `POST /api/auth/logout` - Logout

### Children

- `GET /api/children/[childId]` - Get child profile
- `GET /api/children/[childId]/export` - Export child data (COPPA)
- `PUT /api/children/[childId]/preferences` - Update reading preferences
- `PUT /api/children/[childId]/avatar` - Update avatar

### Parents

- `GET /api/parents/children` - List parent's children
- `POST /api/parents/children` - Create child profile
- `PUT /api/parents/children/[childId]/password` - Reset child password
- `POST /api/parents/invitations` - Send parent invitation
- `POST /api/parents/invitations/[token]/accept` - Accept invitation

### Accounts

- `DELETE /api/accounts/delete` - Delete account

## Database Schema

### Key Tables

- `parents` - Parent user profiles
- `children` - Child user profiles
- `parent_invitations` - Secondary parent invitations
- `onboarding_data` - Child onboarding information
- `data_access_logs` - Audit log for COPPA compliance

See `supabase/migrations/` for complete schema definitions.

## Testing

Run tests:
```bash
npm run test
# or
pnpm test
```

Run integration tests:
```bash
npm run test:integration
```

Run E2E tests:
```bash
npm run test:e2e
```

## Development

### Code Style

- TypeScript for type safety
- ESLint and Prettier for code formatting
- Follow SvelteKit conventions

### Accessibility

All components follow WCAG 2.1 AA standards:
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility

### Responsive Design

- Mobile-first approach
- Breakpoints: xs (475px), sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interfaces for tablet users

## COPPA Compliance

This application complies with COPPA (Children's Online Privacy Protection Act):

- All child accounts are created by parents
- Parents have full control over child data
- Data access is logged for audit purposes
- Parents can export or delete child data at any time
- Minimal data collection from children

## Security

- Row Level Security (RLS) policies enforce data access
- Password hashing for child accounts
- Session management with secure tokens
- Input validation on all endpoints
- Error handling without exposing sensitive information

## Contributing

1. Follow the spec-driven development workflow
2. Write tests before implementation (TDD)
3. Ensure accessibility and responsive design
4. Update documentation as needed

## License

[Your License Here]

## Support

For issues and questions, please open an issue in the repository.



