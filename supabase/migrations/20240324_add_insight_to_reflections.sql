-- Add insight column to reflections table
ALTER TABLE reflections
ADD COLUMN insight TEXT;

-- Add verse_text column to reflections table
ALTER TABLE reflections
ADD COLUMN verse_text TEXT; 