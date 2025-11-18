-- Migration: Create indexes for books table
-- Optimizes queries for filtering, searching, and browsing

-- Index for genre filtering (GIN index for array operations)
CREATE INDEX IF NOT EXISTS idx_books_genre ON mp_reading.books USING GIN (genre);

-- Index for reading level filtering
CREATE INDEX IF NOT EXISTS idx_books_reading_level ON mp_reading.books(reading_level_min, reading_level_max);

-- Index for grade level filtering
CREATE INDEX IF NOT EXISTS idx_books_grade_level ON mp_reading.books(grade_level_min, grade_level_max);

-- Index for Lexile score
CREATE INDEX IF NOT EXISTS idx_books_lexile ON mp_reading.books(lexile_score);

-- Index for active books (most queries will filter by is_active = TRUE)
CREATE INDEX IF NOT EXISTS idx_books_active ON mp_reading.books(is_active) WHERE is_active = TRUE;

-- Full-text search indexes for title and author
CREATE INDEX IF NOT EXISTS idx_books_title_fts ON mp_reading.books USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_books_author_fts ON mp_reading.books USING gin(to_tsvector('english', COALESCE(author, '')));

-- Composite full-text search index for title, author, and summary
CREATE INDEX IF NOT EXISTS idx_books_search_fts ON mp_reading.books USING gin(
  to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(author, '') || ' ' || 
    COALESCE(summary, '')
  )
);

-- Index for created_at (for sorting by newest)
CREATE INDEX IF NOT EXISTS idx_books_created_at ON mp_reading.books(created_at DESC);

-- Index for updated_at (for sorting by recently updated)
CREATE INDEX IF NOT EXISTS idx_books_updated_at ON mp_reading.books(updated_at DESC);



