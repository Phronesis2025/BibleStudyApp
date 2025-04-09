import { NextResponse } from "next/server";
import axios from "axios";

if (!process.env.ESV_API_KEY) {
  throw new Error("Missing env.ESV_API_KEY");
}

const ESV_API_KEY = process.env.ESV_API_KEY;
const ESV_API_URL = "https://api.esv.org/v3/passage/text/";

export async function POST(req: Request) {
  try {
    const { verse } = await req.json();

    if (!verse) {
      return NextResponse.json(
        { error: "Verse reference is required" },
        { status: 400 }
      );
    }

    console.log("Fetching verse:", verse);

    const response = await axios.get(ESV_API_URL, {
      headers: {
        Authorization: `Token ${ESV_API_KEY}`,
      },
      params: {
        q: verse,
        "include-passage-references": false,
        "include-verse-numbers": false,
        "include-first-verse-numbers": false,
        "include-footnotes": false,
        "include-headings": false,
        "include-short-copyright": false,
        "include-passage-horizontal-lines": false,
        "include-heading-horizontal-lines": false,
        "include-selahs": false,
        "indent-paragraphs": 0,
        "indent-poetry": false,
        "indent-declares": 0,
        "indent-psalm-doxology": 0,
        "line-length": 0,
      },
    });

    if (!response.data.passages || response.data.passages.length === 0) {
      return NextResponse.json({ error: "Verse not found" }, { status: 404 });
    }

    // Clean up the verse text
    const verseText = response.data.passages[0]
      .trim()
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\[.*?\]/g, "") // Remove bracketed text
      .replace(/^\d+\s+/, ""); // Remove leading verse numbers

    console.log("Verse text:", verseText);

    return NextResponse.json({
      passages: [verseText],
      query: verse,
    });
  } catch (error: any) {
    console.error("Error fetching verse:", error);
    const errorMessage =
      error.response?.data?.error || error.message || "Failed to fetch verse";
    return NextResponse.json(
      { error: errorMessage },
      { status: error.response?.status || 500 }
    );
  }
}
