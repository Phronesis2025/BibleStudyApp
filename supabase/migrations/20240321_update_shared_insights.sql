-- Drop existing table
DROP TABLE IF EXISTS shared_insights;

-- Create shared_insights table with updated schema
CREATE TABLE shared_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  verse TEXT NOT NULL,
  summary TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX shared_insights_user_id_idx ON shared_insights(user_id);

-- Create index on verse for faster lookups
CREATE INDEX shared_insights_verse_idx ON shared_insights(verse);

-- Enable Row Level Security
ALTER TABLE shared_insights ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own insights
CREATE POLICY "Allow users to insert their own insights"
ON shared_insights
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow users to view public insights
CREATE POLICY "Allow users to view public insights"
ON shared_insights
FOR SELECT
TO authenticated
USING (is_private = false OR user_id = auth.uid()); 