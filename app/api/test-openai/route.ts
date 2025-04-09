import { NextResponse } from "next/server";
import OpenAI from "openai";

// Define an interface for the OpenAI response
interface Choice {
  message: {
    content: string | null;
  };
}

interface OpenAIResponse {
  choices: Choice[];
}

export async function GET(): Promise<Response> {
  try {
    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey });

    // Make a simple test call
    const completion: OpenAIResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say test successful" }],
    });

    // Return successful response
    return NextResponse.json({
      success: true,
      message: "OpenAI API test successful",
      response: completion.choices[0].message.content,
    });
  } catch (error) {
    // Handle error case
    console.error("OpenAI Test Error:", error);

    // Extract error message
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // Return error response
    return NextResponse.json(
      {
        success: false,
        message: "OpenAI API test failed",
        error: { message: errorMessage },
      },
      { status: 500 }
    );
  }
}
