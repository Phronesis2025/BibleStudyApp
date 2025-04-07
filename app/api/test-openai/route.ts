import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET() {
  try {
    console.log("Testing OpenAI API connection...");
    console.log(
      "API Key format:",
      process.env.OPENAI_API_KEY?.substring(0, 10) + "..."
    );

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Make a simple test call
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Say 'test successful' if you can read this message.",
        },
      ],
      max_tokens: 10,
    });

    return NextResponse.json({
      success: true,
      message: "OpenAI API test successful",
      response: completion.choices[0].message.content,
    });
  } catch (error: any) {
    console.error("OpenAI Test Error:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      response: error.response?.data,
      headers: error.response?.headers,
    });

    return NextResponse.json(
      {
        success: false,
        message: "OpenAI API test failed",
        error: {
          message: error.message,
          status: error.status,
          code: error.code,
          type: error.type,
          response: error.response?.data,
        },
      },
      { status: 500 }
    );
  }
}
