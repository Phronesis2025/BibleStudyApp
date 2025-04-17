import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export type ReadingLog = {
  id: string;
  user_id: string;
  verse: string;
  created_at: string;
};

export type Theme = {
  id: string;
  name: string;
  count: number;
};

/**
 * Save a reading record when a user reads a verse
 */
export async function saveReading(
  userId: string,
  verse: string
): Promise<ReadingLog> {
  const { data, error } = await supabase
    .from("reading_log")
    .insert([{ user_id: userId, verse }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get themes associated with a user
 */
export async function getThemes(userId: string): Promise<Theme[]> {
  const { data, error } = await supabase
    .from("themes")
    .select("*")
    .eq("user_id", userId)
    .order("count", { ascending: false })
    .limit(5);

  if (error) throw error;
  return data;
}

/**
 * Get a user's reading history
 */
export async function getReadingHistory(userId: string): Promise<ReadingLog[]> {
  const { data, error } = await supabase
    .from("reading_log")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get verse metrics for a user (e.g., total verses read, reading streaks)
 */
export async function getVerseMetrics(userId: string) {
  // Get total verses read
  const { count: totalVerses, error: countError } = await supabase
    .from("reading_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) throw countError;

  // Get unique verses read
  const { data: uniqueVersesData, error: uniqueError } = await supabase
    .from("reading_log")
    .select("verse")
    .eq("user_id", userId)
    .order("verse");

  if (uniqueError) throw uniqueError;

  // Count unique verses
  const uniqueVerses = new Set(uniqueVersesData.map((item) => item.verse)).size;

  return {
    totalVerses,
    uniqueVerses,
  };
}
