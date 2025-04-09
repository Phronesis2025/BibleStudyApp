-- Enable Row Level Security
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to insert their own reflections" ON reflections;
DROP POLICY IF EXISTS "Allow users to view their own reflections" ON reflections;
DROP POLICY IF EXISTS "Allow users to update their own reflections" ON reflections;
DROP POLICY IF EXISTS "Allow users to delete their own reflections" ON reflections;

-- Create policy to allow users to insert their own reflections
CREATE POLICY "Allow users to insert their own reflections"
ON reflections
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Allow all authenticated users to insert

-- Create policy to allow users to view their own reflections
CREATE POLICY "Allow users to view their own reflections"
ON reflections
FOR SELECT
TO authenticated
USING (true);  -- Allow all authenticated users to view

-- Create policy to allow users to update their own reflections
CREATE POLICY "Allow users to update their own reflections"
ON reflections
FOR UPDATE
TO authenticated
USING (true)  -- Allow all authenticated users to update
WITH CHECK (true);

-- Create policy to allow users to delete their own reflections
CREATE POLICY "Allow users to delete their own reflections"
ON reflections
FOR DELETE
TO authenticated
USING (true);  -- Allow all authenticated users to delete 