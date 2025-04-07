import { NextResponse } from "next/server";
import axios from "axios";

if (!process.env.ESV_API_KEY) {
  throw new Error("Missing env.ESV_API_KEY");
}

export async function POST(request: Request) {
  try {
    const { verse } = await request.json();
    console.log("Received verse request:", verse);

    if (!verse) {
      return NextResponse.json(
        { success: false, message: "Verse reference is required" },
        { status: 400 }
      );
    }

    console.log("Making ESV API request...");
    const response = await axios.get("https://api.esv.org/v3/passage/text/", {
      params: {
        q: verse,
        "include-verse-numbers": true,
        "include-footnotes": false,
        "include-headings": false,
        "include-short-copyright": false,
      },
      headers: {
        Authorization: `Token ${process.env.ESV_API_KEY}`,
      },
    });
    console.log("ESV API response:", response.data);

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error("Verse API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch verse",
        error: error.message,
        details: error.response?.data,
      },
      { status: 500 }
    );
  }
}
