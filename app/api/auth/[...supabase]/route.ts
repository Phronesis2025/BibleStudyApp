import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabaseServerClient";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // If code is not present, redirect to home page
  if (!code) {
    return NextResponse.redirect(new URL("/", requestUrl.origin));
  }

  try {
    const supabase = getServerSupabaseClient();

    // Exchange the authorization code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth callback error:", error);
      return NextResponse.redirect(
        new URL(
          `/?error=${encodeURIComponent(error.message)}`,
          requestUrl.origin
        )
      );
    }

    // Successful authentication, redirect to reading page
    return NextResponse.redirect(new URL("/reading", requestUrl.origin));
  } catch (error: any) {
    console.error("Unexpected error in OAuth callback:", error);
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent("Authentication failed")}`,
        requestUrl.origin
      )
    );
  }
}
