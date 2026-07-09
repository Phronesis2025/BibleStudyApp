import { supabase } from "@/lib/supabaseClient";

export type ReadingLog = {
  id: string;
  user_id: string;
  verse: string;
  created_at: string;
};

/**
 * Log that a user read a verse.
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
