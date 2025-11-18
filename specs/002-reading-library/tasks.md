# Tasks: Adaptive Reading Library - Core Infrastructure

**Input**: Design documents from `/specs/002-reading-library/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: TDD approach required per constitution - tests written before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001-T006 Already completed in Feature 001

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T201 Create database migration for books table in supabase/migrations/009_create_books_table.sql
- [x] T202 Create database migration for book indexes in supabase/migrations/010_create_books_indexes.sql
- [x] T203 Create database migration for RLS policies in supabase/migrations/011_setup_books_rls_policies.sql
- [x] T204 [P] Update TypeScript types from Supabase schema in src/lib/supabase/types.ts
- [x] T205 [P] Create books store in src/lib/stores/books.ts
- [x] T206 [P] Create reading level utilities in src/lib/utils/reading-level.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Browse Book Catalog (Priority: P1)

**Goal**: Enable students to browse the book catalog, see available books, and navigate to book details.

**Independent Test**: Can be fully tested by having a student browse the catalog, see books displayed in a grid/list, and click on a book to view details. The test validates catalog display, book listing, and navigation without requiring filtering or search.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T207 [P] [US1] Contract test for list books endpoint in tests/contract/books-list.test.ts
- [ ] T208 [P] [US1] Contract test for get book endpoint in tests/contract/books-get.test.ts
- [ ] T209 [P] [US1] Integration test for catalog browsing flow in tests/integration/catalog-browse-flow.test.ts

### Implementation for User Story 1

- [x] T210 [US1] Implement list books API endpoint in src/routes/api/books/+server.ts
- [x] T211 [US1] Implement get book API endpoint in src/routes/api/books/[bookId]/+server.ts
- [x] T212 [US1] Create list books function in src/lib/server/api/books/list.ts
- [x] T213 [US1] Create get book function in src/lib/server/api/books/get.ts
- [x] T214 [US1] Create BookCard component in src/lib/components/books/BookCard.svelte
- [x] T215 [US1] Create BookCatalog component in src/lib/components/books/BookCatalog.svelte
- [x] T216 [US1] Create books catalog page route in src/routes/books/+page.svelte
- [x] T217 [US1] Add loading states and error handling for catalog
- [x] T218 [US1] Add pagination support (basic, 20 books per page)
- [x] T219 [US1] Add accessibility features (ARIA labels, keyboard navigation)

**Checkpoint**: At this point, User Story 1 should be fully functional - students can browse the catalog and view book details

---

## Phase 4: User Story 3 - Book Detail Pages (Priority: P1)

**Goal**: Enable students to view detailed information about books before reading.

**Independent Test**: Can be fully tested by having a student navigate to a book detail page and verify all metadata is displayed correctly.

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T220 [P] [US3] Integration test for book detail page in tests/integration/book-detail-flow.test.ts

### Implementation for User Story 3

- [x] T221 [US3] Create BookDetail component in src/lib/components/books/BookDetail.svelte
- [x] T222 [US3] Create book detail page route in src/routes/books/[bookId]/+page.svelte
- [x] T223 [US3] Add reading time calculation utility
- [x] T224 [US3] Add "Start Reading" button placeholder (links to Feature 004)
- [x] T225 [US3] Add accessibility features for book detail page
- [x] T226 [US3] Add responsive design for book detail page

**Checkpoint**: At this point, User Story 3 should be fully functional - students can view detailed book information

---

## Phase 5: User Story 1 Extended - Filtering & Search (Priority: P1)

**Goal**: Enable students to filter books by genre and reading level, and search for books by title or author.

**Independent Test**: Can be fully tested by having a student filter the catalog by genre and reading level, search for books, and verify results are correctly filtered/searched.

### Tests for Filtering & Search ⚠️

- [ ] T227 [P] Contract test for filtered books endpoint in tests/contract/books-filter.test.ts
- [ ] T228 [P] Contract test for search books endpoint in tests/contract/books-search.test.ts
- [ ] T229 [P] Integration test for filtering flow in tests/integration/catalog-filter-flow.test.ts
- [ ] T230 [P] Integration test for search flow in tests/integration/catalog-search-flow.test.ts

### Implementation for Filtering & Search

- [x] T231 Implement filtering in list books API endpoint (genre, reading level, grade level)
- [x] T232 Implement search functionality in list books API endpoint (title, author, summary)
- [x] T233 Create search books function in src/lib/server/api/books/search.ts (integrated into list.ts)
- [x] T234 Create BookFilters component in src/lib/components/books/BookFilters.svelte
- [x] T235 Create BookSearch component in src/lib/components/books/BookSearch.svelte
- [x] T236 Integrate filters with BookCatalog component
- [x] T237 Integrate search with BookCatalog component
- [ ] T238 Add URL query parameter support for filters and search (future enhancement)
- [x] T239 Add clear/reset filters functionality
- [x] T240 Add debouncing for search input
- [x] T241 Add accessibility features for filters and search

**Checkpoint**: At this point, filtering and search should be fully functional

---

## Phase 6: User Story 2 - Book Metadata Management (Priority: P1)

**Goal**: Enable administrators to manage the book catalog (add books, update metadata).

**Independent Test**: Can be fully tested by having an admin (or via direct API calls) add a book, update book metadata, and verify changes appear in the catalog.

### Tests for User Story 2 ⚠️

- [ ] T242 [P] Contract test for create book endpoint in tests/contract/books-create.test.ts
- [ ] T243 [P] Contract test for update book endpoint in tests/contract/books-update.test.ts
- [ ] T244 [P] Integration test for book creation flow in tests/integration/book-create-flow.test.ts

### Implementation for User Story 2

- [ ] T245 Implement create book API endpoint in src/routes/api/books/+server.ts (POST)
- [ ] T246 Implement update book API endpoint in src/routes/api/books/[bookId]/+server.ts (PUT)
- [ ] T247 Create create book function in src/lib/server/api/books/create.ts
- [ ] T248 Create update book function in src/lib/server/api/books/update.ts
- [ ] T249 Add validation for book metadata (title required, genre array, reading level ranges)
- [ ] T250 Add admin authentication check (service role or admin flag)
- [ ] T251 Add logging for book creation/updates (for audit trail)

**Checkpoint**: At this point, User Story 2 should be fully functional - admins can manage book catalog

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T252 [P] Add comprehensive error handling across all book API endpoints
- [ ] T253 [P] Optimize database queries (ensure indexes are used)
- [ ] T254 [P] Add performance monitoring for catalog load times
- [ ] T255 [P] Add responsive design improvements (tablet and mobile)
- [ ] T256 [P] Add loading skeletons for better UX
- [ ] T257 [P] Add empty states (no books found, no search results)
- [ ] T258 [P] Add book cover image fallbacks
- [ ] T259 [P] Add reading level badge component
- [ ] T260 [P] Add genre tag components
- [ ] T261 [P] Code cleanup and refactoring for consistency
- [ ] T262 [P] Update documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Already complete from Feature 001
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Foundational completion - Basic catalog browsing
- **User Story 3 (Phase 4)**: Depends on US1 completion - Needs catalog to navigate from
- **Filtering & Search (Phase 5)**: Depends on US1 completion - Extends catalog functionality
- **User Story 2 (Phase 6)**: Depends on Foundational completion - Can run in parallel with US1
- **Polish (Phase 7)**: Depends on all desired features being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Can start after US1 - Needs catalog to navigate from
- **User Story 2 (P1)**: Can start after Foundational - Can run in parallel with US1

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Database migrations before API endpoints
- API endpoints before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- All tests for a user story marked [P] can run in parallel
- User Story 2 can be developed in parallel with User Story 1 (after Foundational)
- Models and utilities marked [P] can be created in parallel

---

## Implementation Strategy

### MVP First (User Stories 1, 3, and Filtering/Search)

1. Complete Phase 2: Foundational
2. Complete Phase 3: User Story 1 (Basic Catalog)
3. Complete Phase 4: User Story 3 (Book Details)
4. Complete Phase 5: Filtering & Search
5. **STOP and VALIDATE**: Test all catalog functionality independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Catalog browsing working)
3. Add User Story 3 → Test independently → Deploy/Demo (Book details working)
4. Add Filtering & Search → Test independently → Deploy/Demo (Full catalog functionality)
5. Add User Story 2 → Test independently → Deploy/Demo (Admin book management)
6. Polish phase → Final release

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Catalog Browsing)
   - Developer B: User Story 2 (Book Management) - can start in parallel
3. Once US1 is done:
   - Developer A: User Story 3 (Book Details)
   - Developer B: Filtering & Search (extends US1)
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
- All book data is publicly readable by authenticated users (no RLS restrictions for reading)
- Book creation/updates require admin/service role access
- Consider future needs (ratings, reviews, recommendations) when designing schema but don't implement yet

