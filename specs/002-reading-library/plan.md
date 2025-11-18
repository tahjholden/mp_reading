# Implementation Plan: Adaptive Reading Library - Core Infrastructure

**Branch**: `002-reading-library` | **Date**: 2025-11-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-reading-library/spec.md`

## Summary

Build a reading library infrastructure for a reading app targeting 4th-6th grade students. The system includes a PostgreSQL database for book metadata, Supabase Storage for book content, a browsing interface with filtering and search capabilities, and book detail pages. Books are categorized by genre and reading level (Lexile 400-1000). Built on SvelteKit frontend with Supabase backend, following the same architecture patterns as Feature 001.

## Technical Context

**Language/Version**: TypeScript 5.x, JavaScript (ES2022), Svelte 5  
**Primary Dependencies**: SvelteKit, Supabase JS Client, Tailwind CSS  
**Storage**: Supabase PostgreSQL (with RLS policies), Supabase Storage (for book content files)  
**Testing**: Vitest, Playwright (e2e), @testing-library/svelte  
**Target Platform**: Web (browser), optimized for tablets (primary) and desktop/mobile  
**Project Type**: Web application (frontend + backend via Supabase)  
**Performance Goals**: Catalog load <2s, book detail <1s, search <500ms, support 1000+ books  
**Constraints**: WCAG 2.1 AA accessibility, responsive design, scalable to 10,000+ books  
**Scale/Scope**: MVP supports 50-100 books initially, infrastructure scales to 500+

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase -1: Pre-Implementation Gates

#### Simplicity Gate (Article VII)
- [x] Using ≤3 projects? **YES** - Single SvelteKit app with Supabase backend (counts as 1 project)
- [x] No future-proofing? **YES** - MVP scope only, catalog and browsing only (reading interface in Feature 004)

#### Anti-Abstraction Gate (Article VIII)
- [x] Using framework directly? **YES** - SvelteKit and Supabase used directly, no wrappers
- [x] Single model representation? **YES** - Database schema is source of truth, Svelte stores mirror DB state

#### Integration-First Gate (Article IX)
- [x] Contracts defined? **YES** - Will define REST API contracts and Supabase RLS policies
- [x] Contract tests written? **PENDING** - Will be written in Phase 1

#### Test-First Imperative (Article III)
- [x] TDD approach planned? **YES** - Tests written before implementation, Red-Green-Refactor cycle
- [x] Integration tests required? **YES** - Catalog browsing, filtering, search, book detail pages

#### Accessibility by Default (Article II - Constitution)
- [x] WCAG 2.1 AA compliance? **YES** - All catalog interfaces will be accessible
- [x] Keyboard navigation? **YES** - Full keyboard support for browsing and filtering
- [x] Screen reader support? **YES** - Proper ARIA labels and semantic HTML

#### Platform Integration (Article VII - Constitution)
- [x] Using Supabase? **YES** - Leveraging existing Max Potential platform infrastructure
- [x] Using SvelteKit? **YES** - Consistent with existing platform stack

**Gate Status**: ✅ **PASS** - All gates satisfied. Ready for Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/002-reading-library/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── api-spec.json    # OpenAPI specification
│   └── rls-policies.md  # Row Level Security policy definitions
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── components/
│   │   ├── books/
│   │   │   ├── BookCatalog.svelte      # Main catalog browsing interface
│   │   │   ├── BookCard.svelte         # Individual book card component
│   │   │   ├── BookFilters.svelte      # Genre and reading level filters
│   │   │   ├── BookSearch.svelte       # Search input component
│   │   │   └── BookDetail.svelte       # Book detail page component
│   │   └── shared/
│   ├── server/
│   │   └── api/
│   │       └── books/
│   │           ├── list.ts              # List books with filtering
│   │           ├── get.ts                # Get single book
│   │           ├── search.ts             # Search books
│   │           └── create.ts             # Create book (admin)
│   ├── stores/
│   │   └── books.ts                     # Book catalog store
│   └── utils/
│       └── reading-level.ts              # Reading level utilities
├── routes/
│   ├── books/
│   │   ├── +page.svelte                 # Book catalog page
│   │   └── [bookId]/
│   │       └── +page.svelte             # Book detail page
│   └── api/
│       └── books/
│           ├── +server.ts               # GET /api/books (list, search)
│           └── [bookId]/
│               └── +server.ts           # GET /api/books/[bookId]
└── supabase/
    └── migrations/
        └── 009_create_books_table.sql   # Books table migration
```

## Database Schema

### Books Table

```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT,
  genre TEXT[] NOT NULL DEFAULT '{}',
  reading_level_min INTEGER, -- Lexile score minimum
  reading_level_max INTEGER, -- Lexile score maximum
  lexile_score INTEGER,      -- Primary Lexile score (or average)
  grade_level_min INTEGER CHECK (grade_level_min BETWEEN 4 AND 6),
  grade_level_max INTEGER CHECK (grade_level_max BETWEEN 4 AND 6),
  word_count INTEGER,
  page_count INTEGER,
  estimated_reading_minutes INTEGER, -- Calculated from word count
  cover_image_url TEXT,
  summary TEXT,
  content_url TEXT,          -- Supabase Storage path to book content
  content_format TEXT DEFAULT 'text', -- 'text', 'json', 'markdown'
  metadata JSONB DEFAULT '{}', -- Additional metadata (tags, themes, etc.)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_books_genre ON books USING GIN (genre);
CREATE INDEX idx_books_reading_level ON books(reading_level_min, reading_level_max);
CREATE INDEX idx_books_grade_level ON books(grade_level_min, grade_level_max);
CREATE INDEX idx_books_lexile ON books(lexile_score);
CREATE INDEX idx_books_active ON books(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_books_title ON books USING gin(to_tsvector('english', title));
CREATE INDEX idx_books_author ON books USING gin(to_tsvector('english', author));

-- Full-text search index
CREATE INDEX idx_books_search ON books USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(author, '') || ' ' || coalesce(summary, ''))
);
```

### RLS Policies

```sql
-- Books are publicly readable (all authenticated users can browse)
CREATE POLICY "Books are readable by authenticated users"
  ON books FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- Only service role can insert/update/delete books (admin operations)
-- Regular users cannot modify books
```

## API Endpoints

### GET /api/books
List books with filtering and pagination.

**Query Parameters**:
- `genre` (optional): Filter by genre (can be repeated for multiple)
- `reading_level_min` (optional): Minimum Lexile score
- `reading_level_max` (optional): Maximum Lexile score
- `grade_level` (optional): Filter by grade level (4, 5, or 6)
- `search` (optional): Search query (title, author, summary)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)

**Response**:
```json
{
  "books": [
    {
      "id": "uuid",
      "title": "Book Title",
      "author": "Author Name",
      "genre": ["Adventure", "Fantasy"],
      "reading_level_min": 500,
      "reading_level_max": 700,
      "lexile_score": 600,
      "grade_level_min": 4,
      "grade_level_max": 5,
      "word_count": 50000,
      "page_count": 200,
      "estimated_reading_minutes": 120,
      "cover_image_url": "https://...",
      "summary": "Book summary...",
      "is_active": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### GET /api/books/[bookId]
Get detailed information about a single book.

**Response**:
```json
{
  "id": "uuid",
  "title": "Book Title",
  "author": "Author Name",
  "genre": ["Adventure", "Fantasy"],
  "reading_level_min": 500,
  "reading_level_max": 700,
  "lexile_score": 600,
  "grade_level_min": 4,
  "grade_level_max": 5,
  "word_count": 50000,
  "page_count": 200,
  "estimated_reading_minutes": 120,
  "cover_image_url": "https://...",
  "summary": "Full book summary...",
  "metadata": {},
  "content_url": "books/uuid/content.txt",
  "content_format": "text",
  "is_active": true,
  "created_at": "2025-11-16T...",
  "updated_at": "2025-11-16T..."
}
```

## Component Architecture

### BookCatalog.svelte
Main catalog browsing component.
- Displays books in grid/list view
- Integrates BookFilters and BookSearch
- Handles pagination
- Manages loading and error states

### BookCard.svelte
Individual book card component.
- Displays cover image, title, author
- Shows reading level badge
- Clickable to navigate to book detail
- Accessible with proper ARIA labels

### BookFilters.svelte
Filtering interface component.
- Genre multi-select
- Reading level range selector
- Grade level selector
- Clear filters button
- Accessible form controls

### BookSearch.svelte
Search input component.
- Search input with debouncing
- Clear search button
- Search results highlighting (future)
- Accessible search form

### BookDetail.svelte
Book detail page component.
- Full book metadata display
- Cover image
- Summary and author info
- Reading level indicators
- "Start Reading" button (links to Feature 004)
- Accessible page structure

## Storage Strategy

### Book Content Storage
- Books stored in Supabase Storage bucket: `books`
- Path structure: `books/{bookId}/content.{format}`
- Formats supported: `.txt`, `.json`, `.md`
- Content structure:
  - Plain text: Simple text file with page breaks (`\n\n\n` for page breaks)
  - JSON: Structured format with pages/chapters
  - Markdown: Markdown format with page breaks

### Cover Images
- Stored in Supabase Storage bucket: `book-covers`
- Path structure: `book-covers/{bookId}.jpg` (or .png)
- Fallback: Placeholder image if cover not available
- CDN: Served via Supabase Storage CDN

## Implementation Phases

### Phase 1: Database & API (Foundation)
1. Create books table migration
2. Create indexes for performance
3. Set up RLS policies
4. Implement GET /api/books endpoint
5. Implement GET /api/books/[bookId] endpoint
6. Write contract tests

### Phase 2: Catalog UI (Browsing)
1. Create BookCatalog component
2. Create BookCard component
3. Create books catalog page route
4. Integrate with API
5. Add loading and error states
6. Write integration tests

### Phase 3: Filtering & Search
1. Create BookFilters component
2. Create BookSearch component
3. Integrate filters with catalog
4. Implement search functionality
5. Add URL query parameter support
6. Write integration tests

### Phase 4: Book Detail Pages
1. Create BookDetail component
2. Create book detail page route
3. Integrate with API
4. Add reading time calculation
5. Add "Start Reading" placeholder button
6. Write integration tests

### Phase 5: Polish & Optimization
1. Add accessibility features
2. Optimize database queries
3. Add pagination
4. Performance testing
5. Responsive design refinement
6. Documentation

## Testing Strategy

### Contract Tests
- Test API endpoints with various query parameters
- Test filtering combinations
- Test search functionality
- Test pagination
- Test error cases (invalid bookId, etc.)

### Integration Tests
- Test catalog browsing flow
- Test filtering flow
- Test search flow
- Test book detail page navigation
- Test responsive design

### E2E Tests
- Test complete catalog browsing experience
- Test filtering and search user flows
- Test book detail page access

## Performance Considerations

1. **Database Indexing**: All filter and search columns indexed
2. **Pagination**: Limit results to 20-100 per page
3. **Image Optimization**: Use CDN for cover images, lazy loading
4. **Query Optimization**: Use specific column selects, avoid SELECT *
5. **Caching**: Consider client-side caching of book catalog (future)

## Security Considerations

1. **RLS Policies**: Books readable by all authenticated users
2. **Input Validation**: Validate all query parameters
3. **SQL Injection**: Use parameterized queries (Supabase handles this)
4. **Rate Limiting**: Consider rate limiting for search (future)

## Future Enhancements (Out of Scope for MVP)

- Book recommendations (Feature 006)
- Reading progress integration (Feature 003)
- User book lists/favorites
- Book reviews and ratings
- Reading history
- Book preview/sample pages
- Advanced search (full-text search improvements)



