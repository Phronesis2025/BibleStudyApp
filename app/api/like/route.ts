import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Parse request body
    const { userId, reflectionId, like } = await request.json();
    console.log("Received like request:", { userId, reflectionId, like });

    if (!userId || !reflectionId) {
      console.error("Missing required fields:", { userId, reflectionId });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // First, check if the reflection exists and log the query
    console.log("Fetching reflection:", reflectionId);
    const { data: reflection, error: fetchError } = await supabase
      .from("reflections")
      .select("id, likes")
      .eq("id", reflectionId)
      .single();

    // Log the fetch results
    if (fetchError) {
      console.error("Error fetching reflection:", {
        error: fetchError,
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint,
        code: fetchError.code,
      });
      return NextResponse.json(
        { error: `Failed to fetch reflection: ${fetchError.message}` },
        { status: 500 }
      );
    }

    console.log("Fetched reflection:", reflection);

    if (!reflection) {
      console.error("Reflection not found:", reflectionId);
      return NextResponse.json(
        { error: "Reflection not found" },
        { status: 404 }
      );
    }

    // Update just the likes count for now
    const currentLikes = reflection.likes || 0;
    const newLikes = like ? currentLikes + 1 : Math.max(0, currentLikes - 1);

    console.log("Updating reflection with:", { newLikes });

    // Update the reflection with only the likes count
    const { data: updatedReflection, error: updateError } = await supabase
      .from("reflections")
      .update({
        likes: newLikes,
      })
      .eq("id", reflectionId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating reflection:", {
        error: updateError,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code,
      });
      return NextResponse.json(
        { error: `Failed to update reflection: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.log("Successfully updated reflection:", updatedReflection);

    return NextResponse.json({
      success: true,
      likes: newLikes,
      likedBy: [], // Return empty array until liked_by column is added
    });
  } catch (error: unknown) {
    console.error("Error liking reflection:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
