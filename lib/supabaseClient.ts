// lib/supabaseClient.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "../types";

/**
 * Client-side Supabase client for use in client components
 *
 * This client should be used in any component with the "use client" directive.
 * It uses createClientComponentClient which is safe for client components.
 */
export const getSupabaseClient = () => createClientComponentClient<Database>();
