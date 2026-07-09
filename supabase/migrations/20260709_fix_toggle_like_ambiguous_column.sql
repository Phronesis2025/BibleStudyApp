-- Fix toggle_like: the previous version declared a PL/pgSQL variable named
-- "liked_by", which collides with the reflections.liked_by column and makes
-- every reference ambiguous (error 42702), so the function always failed.
-- The variable is renamed to v_liked_by. SECURITY DEFINER is required so a
-- user can like someone else's reflection without an UPDATE policy on that row.
CREATE OR REPLACE FUNCTION toggle_like(
  p_reflection_id UUID,
  p_user_id UUID,
  p_like BOOLEAN
) RETURNS JSON AS $$
DECLARE
  v_likes INTEGER;
  v_liked_by UUID[];
BEGIN
  SELECT likes, liked_by INTO v_likes, v_liked_by
  FROM reflections
  WHERE id = p_reflection_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reflection with ID % not found', p_reflection_id;
  END IF;

  IF v_liked_by IS NULL THEN
    v_liked_by := '{}';
  END IF;
  IF v_likes IS NULL THEN
    v_likes := 0;
  END IF;

  IF p_like = TRUE THEN
    IF NOT (p_user_id = ANY(v_liked_by)) THEN
      v_liked_by := array_append(v_liked_by, p_user_id);
      v_likes := v_likes + 1;
    END IF;
  ELSE
    IF p_user_id = ANY(v_liked_by) THEN
      v_liked_by := array_remove(v_liked_by, p_user_id);
      v_likes := GREATEST(0, v_likes - 1);
    END IF;
  END IF;

  UPDATE reflections
  SET likes = v_likes,
      liked_by = v_liked_by
  WHERE id = p_reflection_id;

  RETURN json_build_object(
    'likes', v_likes,
    'liked_by', v_liked_by
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
