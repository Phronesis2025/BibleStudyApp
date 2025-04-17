-- Ensure the reflections table has likes and liked_by columns
DO $$ 
BEGIN
  -- Add likes column if not exists
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'reflections' AND column_name = 'likes'
  ) THEN
    ALTER TABLE reflections ADD COLUMN likes INTEGER DEFAULT 0;
  ELSE
    ALTER TABLE reflections ALTER COLUMN likes SET DEFAULT 0;
    UPDATE reflections SET likes = 0 WHERE likes IS NULL;
  END IF;

  -- Add liked_by column if not exists
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'reflections' AND column_name = 'liked_by'
  ) THEN
    ALTER TABLE reflections ADD COLUMN liked_by UUID[] DEFAULT '{}';
  END IF;
END $$;

-- Updated toggle_like function
CREATE OR REPLACE FUNCTION toggle_like(
  p_reflection_id UUID,
  p_user_id UUID,
  p_like BOOLEAN
) RETURNS JSON AS $$
DECLARE
  current_likes INTEGER;
  liked_by UUID[];
  result JSON;
BEGIN
  -- Fetch current likes and liked_by from the reflection with locking
  SELECT likes, liked_by INTO current_likes, liked_by
  FROM reflections
  WHERE id = p_reflection_id
  FOR UPDATE;

  -- Check if reflection exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reflection with ID % not found', p_reflection_id;
  END IF;
  
  -- Initialize liked_by if null
  IF liked_by IS NULL THEN
    liked_by := '{}';
  END IF;
  
  IF p_like = TRUE THEN
    -- Add user to liked_by if not already present
    IF NOT (p_user_id = ANY(liked_by)) THEN
      liked_by := array_append(liked_by, p_user_id);
      current_likes := current_likes + 1;
    END IF;
  ELSE
    -- Remove user from liked_by if present
    IF p_user_id = ANY(liked_by) THEN
      liked_by := array_remove(liked_by, p_user_id);
      current_likes := GREATEST(0, current_likes - 1);
    END IF;
  END IF;
  
  -- Update the reflection
  UPDATE reflections
  SET 
    likes = current_likes,
    liked_by = liked_by
  WHERE id = p_reflection_id;
  
  -- Prepare the result
  SELECT json_build_object(
    'likes', current_likes,
    'liked_by', liked_by
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;