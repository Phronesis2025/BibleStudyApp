import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export type Reflection = {
  id: string;
  user_id: string;
  verse: string;
  question?: string;
  answer?: string;
  content?: string;
  created_at: string;
  insight?: string;
};

export type SharedInsight = {
  id: string;
  user_id: string;
  verse: string;
  content: string;
  created_at: string;
  likes?: number;
};

/**
 * Save a user's reflection on a Bible verse
 */
export async function saveReflection(
  userId: string,
  verse: string,
  question: string,
  answer: string
): Promise<void> {
  // Ensure userId is a valid UUID
  if (
    !userId.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
  ) {
    throw new Error("Invalid user ID format");
  }

  const { error } = await supabase
    .from("reflections")
    .insert([
      {
        user_id: userId,
        verse,
        question,
        answer,
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    throw new Error(`Failed to save reflection: ${error.message}`);
  }
}

/**
 * Share an insight from a user's reflection
 */
export async function shareInsight(
  userId: string,
  verse: string,
  content: string
): Promise<SharedInsight> {
  const { data, error } = await supabase
    .from("shared_insights")
    .insert([{ user_id: userId, verse, content }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all shared insights
 */
export async function getSharedInsights(): Promise<SharedInsight[]> {
  const { data, error } = await supabase
    .from("shared_insights")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get a user's reflections
 */
export async function getUserReflections(
  userId: string
): Promise<Reflection[]> {
  const { data, error } = await supabase
    .from("reflections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Toggle like on a shared insight
 */
export async function toggleLike(
  userId: string,
  insightId: string
): Promise<{ success: boolean }> {
  const { data, error } = await supabase.rpc("toggle_like", {
    p_user_id: userId,
    p_insight_id: insightId,
  });

  if (error) throw error;
  return { success: true };
}
