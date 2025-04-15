import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export type User = {
  id: string;
  name: string;
  created_at: string;
};

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

export type Reflection = {
  id: string;
  user_id: string;
  verse: string;
  content: string;
  created_at: string;
};

export type SharedInsight = {
  id: string;
  user_id: string;
  verse: string;
  content: string;
  created_at: string;
};

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createUser(name: string): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert([{ name }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

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

  console.log("Attempting to save reflection with data:", {
    userId,
    verse,
    question,
    answer,
  });

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
    .select(); // Add .select() to get the inserted record

  if (error) {
    console.error("Supabase error details:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw new Error(`Failed to save reflection: ${error.message}`);
  }
}

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

export async function getSharedInsights(): Promise<SharedInsight[]> {
  const { data, error } = await supabase
    .from("shared_insights")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
