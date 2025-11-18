-- Migration: Create books table
-- Stores book metadata for the reading library

CREATE TABLE IF NOT EXISTS mp_reading.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Add comment to table
COMMENT ON TABLE mp_reading.books IS 'Book catalog metadata for reading library';

-- Add comments to key columns
COMMENT ON COLUMN mp_reading.books.lexile_score IS 'Primary Lexile score (400-1000 range for 4th-6th grade)';
COMMENT ON COLUMN mp_reading.books.genre IS 'Array of genres (e.g., ["Adventure", "Fantasy"])';
COMMENT ON COLUMN mp_reading.books.content_url IS 'Path to book content file in Supabase Storage';
COMMENT ON COLUMN mp_reading.books.content_format IS 'Format of book content: text, json, or markdown';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON mp_reading.books TO authenticated;
GRANT ALL ON mp_reading.books TO service_role;



