-- Security audit fixes (applied 2026-07-09 via the dashboard SQL editor).
--
-- 1. users: the permissive public-role policies let any holder of the anon
--    key (no session required) list every user row and insert rows with
--    arbitrary ids. The authenticated own-row policies (users_select_own,
--    users_insert_own, users_update_own) remain and cover everything the app
--    does.
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own user" ON public.users;

-- 2. shared_insights: a SELECT-true policy nullified the table's own
--    (is_private = false OR user_id = auth.uid()) filter. The app no longer
--    uses this table.
DROP POLICY IF EXISTS "Users can view all shared insights" ON public.shared_insights;

-- 3. toggle_like: it is SECURITY DEFINER (bypasses RLS), so it must not be
--    callable anonymously, and it must not trust a caller-supplied user id —
--    otherwise likes can be forged or removed on behalf of any user.
REVOKE EXECUTE ON FUNCTION public.toggle_like(uuid, uuid, boolean) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.toggle_like(uuid, uuid, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.toggle_like(uuid, uuid, boolean) TO authenticated;

-- Same function as 20260709_fix_toggle_like_ambiguous_column.sql, with the
-- caller-identity guard added. The signature is unchanged; the app always
-- passes the signed-in user's own id.
CREATE OR REPLACE FUNCTION toggle_like(
  p_reflection_id UUID,
  p_user_id UUID,
  p_like BOOLEAN
) RETURNS JSON AS $$
DECLARE
  v_likes INTEGER;
  v_liked_by UUID[];
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'p_user_id must match the authenticated user';
  END IF;

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
