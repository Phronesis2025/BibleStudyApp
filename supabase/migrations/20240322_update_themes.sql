-- Check if the table exists and update it if needed
DO $$ 
BEGIN
    -- Check if the table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'themes') THEN
        -- Drop existing columns if they exist with different names
        ALTER TABLE themes DROP COLUMN IF EXISTS theme_name;
        ALTER TABLE themes DROP COLUMN IF EXISTS theme_text;
        ALTER TABLE themes DROP COLUMN IF EXISTS theme_value;
        
        -- Add any missing columns
        ALTER TABLE themes 
        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id),
        ADD COLUMN IF NOT EXISTS verse TEXT,
        ADD COLUMN IF NOT EXISTS theme TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Create indexes if they don't exist
        CREATE INDEX IF NOT EXISTS themes_user_id_idx ON themes(user_id);
        CREATE INDEX IF NOT EXISTS themes_verse_idx ON themes(verse);
        
        -- Enable RLS if not already enabled
        ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
        
        -- Create policies if they don't exist
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'themes' AND policyname = 'Allow inserting themes') THEN
                CREATE POLICY "Allow inserting themes"
                ON themes
                FOR INSERT
                TO PUBLIC
                WITH CHECK (true);
            END IF;
            
            IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'themes' AND policyname = 'Allow viewing themes') THEN
                CREATE POLICY "Allow viewing themes"
                ON themes
                FOR SELECT
                TO PUBLIC
                USING (true);
            END IF;
        END $$;
    ELSE
        -- Create the table if it doesn't exist
        CREATE TABLE themes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) NOT NULL,
            verse TEXT NOT NULL,
            theme TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );

        -- Create indexes
        CREATE INDEX themes_user_id_idx ON themes(user_id);
        CREATE INDEX themes_verse_idx ON themes(verse);

        -- Enable RLS
        ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Allow inserting themes"
        ON themes
        FOR INSERT
        TO PUBLIC
        WITH CHECK (true);

        CREATE POLICY "Allow viewing themes"
        ON themes
        FOR SELECT
        TO PUBLIC
        USING (true);
    END IF;
END $$; 