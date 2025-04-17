import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export type User = {
  id: string;
  name: string;
  created_at: string;
};

/**
 * Get all users from the database
 */
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Create a new user in the database
 */
export async function createUser(name: string): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert([{ name }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user profile by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // PGRST116 means no rows returned
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
