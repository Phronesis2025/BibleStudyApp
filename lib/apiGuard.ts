import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// In-memory sliding-window rate limiter.
//
// LIMITATIONS (acceptable for a demo, not for scale): state lives in one
// server process, so it resets on every deploy/restart and is not shared
// across serverless instances or regions — a determined abuser hitting many
// instances gets `limit` requests per instance. For real protection move this
// to a shared store (Upstash/Redis) or an edge middleware product.
const WINDOW_MS = 60_000;
const buckets = new Map<string, number[]>();

function allowRequest(key: string, limit: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  // Opportunistic cleanup so the map can't grow unbounded.
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.length === 0 || now - v[v.length - 1] > WINDOW_MS) buckets.delete(k);
    }
  }
  return true;
}

/**
 * Gate an API route: require a valid Supabase session (JWT verified against
 * the Supabase auth server, not just decoded from the cookie) and apply a
 * per-user rate limit. Returns the userId on success, or a ready-to-return
 * error response.
 */
export async function requireSession(
  routeName: string,
  limitPerMinute: number
): Promise<{ userId: string; errorResponse?: never } | { userId?: never; errorResponse: NextResponse }> {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  if (!allowRequest(`${routeName}:${user.id}`, limitPerMinute)) {
    return {
      errorResponse: NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      ),
    };
  }

  return { userId: user.id };
}

// Verse references are short ("Song of Solomon 2:1-5" is 21 chars); the cap
// is generous. The charset covers book names, chapter:verse, and ranges.
const VERSE_REF_PATTERN = /^[1-3]?\s?[A-Za-z][A-Za-z\s.']{0,40}\s?\d{0,3}(:\d{1,3}([-–]\d{1,3})?)?$/;

export function isValidVerseRef(verse: unknown): verse is string {
  return (
    typeof verse === "string" &&
    verse.trim().length > 0 &&
    verse.length <= 50 &&
    VERSE_REF_PATTERN.test(verse.trim())
  );
}

export function isValidVerseContent(content: unknown): content is string {
  return (
    typeof content === "string" &&
    content.trim().length > 0 &&
    content.length <= 6000
  );
}
