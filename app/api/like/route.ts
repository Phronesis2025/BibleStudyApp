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

    // First, check if the reflection exists and fetch current likes and liked_by
    console.log("Fetching reflection:", reflectionId);
    const { data: reflection, error: fetchError } = await supabase
      .from("reflections")
      .select("id, likes, liked_by")
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

    // Process the liked_by array
    const currentLikes = reflection.likes || 0;
    let likedBy = Array.isArray(reflection.liked_by) ? reflection.liked_by : [];
    let newLikes = currentLikes;

    if (like) {
      // Add user to liked_by if not already present and increment likes
      if (!likedBy.includes(userId)) {
        likedBy.push(userId);
        newLikes = currentLikes + 1;
      }
    } else {
      // Remove user from liked_by if present and decrement likes
      const index = likedBy.indexOf(userId);
      if (index !== -1) {
        likedBy.splice(index, 1);
        newLikes = Math.max(0, currentLikes - 1);
      }
    }

    console.log("Updating reflection with:", { newLikes, likedBy });

    // Update the reflection with likes count and liked_by array
    const { data: updatedReflection, error: updateError } = await supabase
      .from("reflections")
      .update({
        likes: newLikes,
        liked_by: likedBy,
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
      likedBy: likedBy,
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
