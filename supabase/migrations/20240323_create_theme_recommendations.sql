-- Create theme recommendations table
CREATE TABLE IF NOT EXISTS theme_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme TEXT NOT NULL,
  verse TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial theme-verse mappings
INSERT INTO theme_recommendations (theme, verse, description) VALUES
  ('faith', 'Hebrews 11:1', 'The classic definition of faith as confidence in what we hope for'),
  ('faith', 'Romans 10:17', 'How faith comes through hearing the word of Christ'),
  ('love', '1 Corinthians 13:4-7', 'The definitive description of what love is and does'),
  ('love', '1 John 4:19', 'We love because God first loved us'),
  ('hope', 'Romans 15:13', 'A prayer for hope to fill you with joy and peace'),
  ('hope', 'Jeremiah 29:11', 'God''s plans to give you hope and a future'),
  ('peace', 'Philippians 4:7', 'The peace of God that transcends understanding'),
  ('peace', 'John 14:27', 'The peace that Jesus leaves with us'),
  ('wisdom', 'James 1:5', 'How to ask God for wisdom'),
  ('wisdom', 'Proverbs 9:10', 'The beginning of wisdom'),
  ('truth', 'John 8:32', 'The truth that sets us free'),
  ('truth', 'John 14:6', 'Jesus as the way, truth, and life'),
  ('grace', 'Ephesians 2:8-9', 'Salvation by grace through faith'),
  ('grace', '2 Corinthians 12:9', 'God''s grace is sufficient in weakness'),
  ('mercy', 'Lamentations 3:22-23', 'God''s mercies are new every morning'),
  ('mercy', 'Titus 3:5', 'God saved us because of His mercy'),
  ('salvation', 'Acts 4:12', 'Salvation found in no one else'),
  ('salvation', 'Romans 10:9', 'How to be saved through faith in Christ'),
  ('righteousness', 'Matthew 6:33', 'Seeking first God''s kingdom and righteousness'),
  ('righteousness', '2 Corinthians 5:21', 'Becoming the righteousness of God');

-- Enable RLS
ALTER TABLE theme_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policy for reading recommendations
CREATE POLICY "Allow public read access to theme recommendations"
  ON theme_recommendations
  FOR SELECT
  TO PUBLIC
  USING (true); 