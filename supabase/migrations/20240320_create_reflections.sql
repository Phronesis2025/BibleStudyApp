-- Drop the table if it exists
DROP TABLE IF EXISTS reflections;

-- Create reflections table
CREATE TABLE reflections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  verse TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_shared BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX reflections_user_id_idx ON reflections(user_id);

-- Create index on verse for faster lookups
CREATE INDEX reflections_verse_idx ON reflections(verse);

-- Enable Row Level Security
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to insert their own reflections" ON reflections;
DROP POLICY IF EXISTS "Allow users to view shared reflections" ON reflections;
DROP POLICY IF EXISTS "Allow users to update their own reflections" ON reflections;
DROP POLICY IF EXISTS "Allow users to delete their own reflections" ON reflections;

-- Create policy to allow inserting reflections
CREATE POLICY "Allow inserting reflections"
ON reflections
FOR INSERT
TO PUBLIC
WITH CHECK (true);

-- Create policy to allow viewing shared reflections
CREATE POLICY "Allow viewing shared reflections"
ON reflections
FOR SELECT
TO PUBLIC
USING (true);

-- Create policy to allow updating reflections
CREATE POLICY "Allow updating reflections"
ON reflections
FOR UPDATE
TO PUBLIC
USING (true)
WITH CHECK (true);

-- Create policy to allow deleting reflections
CREATE POLICY "Allow deleting reflections"
ON reflections
FOR DELETE
TO PUBLIC
USING (true); 