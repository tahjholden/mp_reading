<!--
Sync Impact Report:
- Version change: Template → 1.0.0 (initial creation)
- Modified principles: None (all new)
- Added sections: Constraints-Led Approach, Accessibility, Privacy & Compliance, Gamification Philosophy, Assessment Design, Platform Integration
- Removed sections: None (template replaced)
- Templates requiring updates: ✅ constitution.md (this file)
- Follow-up TODOs: None
-->

# Reading Acceleration App Constitution

## Core Principles

### I. Constraints-Led Approach (CLA) Methodology
Every feature MUST apply Constraints-Led Approach principles to reading development. Reading "constraints" (choice, gamification, social collaboration, adaptive difficulty) guide learning without prescribing rigid paths. Features must provide meaningful constraints that motivate reluctant readers through autonomy, challenge, and engagement. All learning pathways must be adaptive and responsive to student progress, not fixed or prescriptive.

**Rationale**: The app's core innovation is applying proven CLA methodology from sports training to reading development. This differentiates the product and ensures authentic application of the Max Potential platform's foundational methodology.

### II. Accessibility by Default
All content and features MUST be accessible to diverse learners, including those with dyslexia, ADHD, language processing challenges, and varying reading abilities. This includes: adjustable text display (font size, spacing, background color), text-to-speech capabilities, visual comprehension support, multiple input/output modalities, and clear navigation patterns.

**Rationale**: 65% of 4th graders are not reading at proficiency level, and many have learning differences. Accessibility is not optional—it's essential for serving the target audience effectively.

### III. Privacy and COPPA Compliance (NON-NEGOTIABLE)
Student data protection MUST comply with COPPA (Children's Online Privacy Protection Act) and FERPA (Family Educational Rights and Privacy Act). All student data collection must be minimal, necessary, and transparent. Parental consent mechanisms are required. Row Level Security (RLS) policies must enforce data isolation. No data collection from students under 13 without explicit parent consent.

**Rationale**: Legal compliance is mandatory for serving children. Violations carry severe financial and reputational consequences. Privacy is a competitive advantage and trust requirement.

### IV. Gamification That Celebrates Effort and Growth
Rewards and recognition MUST emphasize progress and effort, not just completion or perfection. Achievement systems must reward reading diversity, skill-building, and persistence. Streaks and goals should be customizable and achievable. Avoid punitive measures or demotivating failure states.

**Rationale**: Reluctant readers need motivation through positive reinforcement. Celebrating effort builds confidence and intrinsic motivation, which is essential for long-term reading engagement.

### V. Invisible Assessment
Comprehension checks and assessments MUST feel natural and embedded in the reading experience, not like tests. Micro-comprehension checks should appear after every 2-3 pages, not at chapter ends. Questions should feel like part of the story engagement, not evaluation. Immediate, supportive feedback is required—never punitive or discouraging.

**Rationale**: Traditional quiz-heavy approaches demotivate reluctant readers. Invisible assessment maintains engagement while gathering necessary progress data.

### VI. Test-First Development (NON-NEGOTIABLE)
All implementation MUST follow strict Test-Driven Development. Tests written → User approved → Tests fail → Then implement. Red-Green-Refactor cycle strictly enforced. Integration tests required for: authentication flows, reading session tracking, recommendation algorithms, and data privacy boundaries.

**Rationale**: Ensures reliability and correctness, especially critical for student data handling and educational outcomes.

### VII. Platform Integration
Features MUST leverage existing Max Potential platform infrastructure: SvelteKit/Supabase architecture, shared authentication, Supabase Storage, Edge Functions, and existing design patterns. New features should integrate seamlessly with the basketball training app infrastructure where beneficial, while maintaining clear product boundaries.

**Rationale**: Reduces development time, infrastructure costs, and operational complexity. Enables future cross-product opportunities (unified family accounts, shared CLA methodology branding).

### VIII. Simplicity and User Experience
Every interaction MUST feel engaging and game-like for students, while remaining simple and trustworthy for parents and teachers. Avoid over-engineering. Start with MVP features, validate with users, then iterate. UI must be intuitive for 9-12 year olds without feeling "babyish."

**Rationale**: Reluctant readers need delightful experiences. Parents and teachers need confidence in the tool's effectiveness. Complexity kills adoption.

## Technology Stack Constraints

### Required Technologies
- **Frontend**: SvelteKit with Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI/ML**: OpenAI API (Whisper for speech, GPT-4 for comprehension), TensorFlow.js for client-side models
- **Deployment**: Vercel (frontend), Supabase (backend)
- **Payment**: Stripe (existing integration)

### Database Standards
- All tables MUST use Row Level Security (RLS) policies
- Student data tables MUST enforce parent/teacher access controls
- Use Supabase Auth for all authentication
- Store sensitive data (reading levels, preferences) as JSONB for flexibility

### API Design
- RESTful endpoints for all data operations
- Real-time subscriptions via Supabase Realtime for live updates (leaderboards, social features)
- Edge Functions for AI processing and sensitive operations

## Development Workflow

### Feature Development Process
1. Specification phase: Define WHAT and WHY (user value, not implementation)
2. Planning phase: Define HOW (tech stack, architecture decisions)
3. Task breakdown: Generate executable task list
4. Implementation: TDD cycle with integration tests
5. Validation: User acceptance testing with target age group (9-12 years)

### Quality Gates
- All features must pass accessibility audit (WCAG 2.1 AA minimum)
- Privacy impact assessment required for any new data collection
- Performance: Reading interface must load in <2 seconds, page turns <500ms
- Mobile-responsive design required (tablets are primary device for target age)

### User Testing Requirements
- Beta features must be tested with 5-10 students in target age range
- Parent feedback required for parent/teacher dashboard features
- Teacher feedback required for classroom management features

## Governance

This constitution supersedes all other development practices and guidelines. All implementation plans, feature specifications, and code reviews MUST verify compliance with these principles.

**Amendment Process**:
- Amendments require documentation of rationale and impact assessment
- Version increments follow semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR: Backward incompatible principle changes
- MINOR: New principles or materially expanded guidance
- PATCH: Clarifications and non-semantic refinements

**Compliance Review**:
- All PRs must include constitution compliance checklist
- Quarterly review of principles against product outcomes
- User feedback and metrics inform principle evolution

**Version**: 1.0.0 | **Ratified**: 2025-11-14 | **Last Amended**: 2025-11-14
