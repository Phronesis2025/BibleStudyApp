// lib/supabaseClient.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "../types";

// The single shared browser client for the entire app. Creating more than one
// GoTrueClient in the same browser context makes them contend for the same
// auth storage key, which causes auth and DB calls to hang forever. Never
// create another client on the client side — import this instance instead.
//
// GoTrueClient serializes auth work behind a cross-tab Web Lock
// (navigator.locks), so ONE wedged holder hangs auth and DB calls in EVERY
// tab on this origin. The known way to wedge it is calling any supabase.*
// method inside an onAuthStateChange callback (see context/AuthContext.tsx).
// The withTimeout guards below bound the damage to a visible 10s error
// instead of an indefinite hang. (A previous attempt to opt out of the lock
// via a custom-constructed client broke session handling entirely; don't
// retry that without end-to-end verification.)
export const supabase = createClientComponentClient<Database>();

export const getSupabaseClient = () => supabase;

// Safety net for user-facing DB/auth calls: surfaces a visible error instead
// of hanging forever if a request never settles.
export async function withTimeout<T>(
  promise: PromiseLike<T>,
  ms = 10000,
  label = "Request"
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms / 1000} seconds`)),
      ms
    );
  });
  try {
    return await Promise.race([Promise.resolve(promise), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export async function initAnonymousSession(): Promise<string> {
  const {
    data: { session },
  } = await withTimeout(supabase.auth.getSession(), 10000, "Checking session");
  let userId: string;
  if (session?.user) {
    userId = session.user.id;
  } else {
    const { data, error } = await withTimeout(
      supabase.auth.signInAnonymously(),
      10000,
      "Anonymous sign-in"
    );
    if (error || !data.user) {
      throw new Error(error?.message ?? "Anonymous sign-in failed");
    }
    userId = data.user.id;
  }
  await withTimeout(
    supabase
      .from("users")
      .upsert([{ id: userId, name: "Demo Visitor" }], { onConflict: "id" }),
    10000,
    "Creating user profile"
  );
  return userId;
}
