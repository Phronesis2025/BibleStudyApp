import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "../types";

/**
 * Server-side Supabase client for use in server components or API routes
 *
 * This client should ONLY be used in:
 * 1. Server Components (not marked with "use client")
 * 2. Route Handlers (e.g., API routes)
 * 3. Server Actions
 *
 * It uses cookies from next/headers which is not compatible with client components.
 */
export const getServerSupabaseClient = () =>
  createServerComponentClient<Database>({ cookies });
