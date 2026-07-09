import { NextResponse } from "next/server";
import axios from "axios";
import { logger } from "@/lib/logger";
import { requireSession, isValidVerseRef } from "@/lib/apiGuard";

// Define an interface for verse data
interface VerseData {
  reference: string;
  text: string;
}

if (!process.env.ESV_API_KEY) {
  throw new Error("Missing env.ESV_API_KEY");
}

const ESV_API_KEY = process.env.ESV_API_KEY;
const ESV_API_URL = "https://api.esv.org/v3/passage/text/";

export async function POST(req: Request): Promise<Response> {
  try {
    const guard = await requireSession("verse", 30);
    if (guard.errorResponse) return guard.errorResponse;

    const { verse } = await req.json();

    if (!isValidVerseRef(verse)) {
      return NextResponse.json(
        { error: "A valid verse reference is required (e.g., John 3:16)" },
        { status: 400 }
      );
    }

    logger.log("[Verse] fetching:", verse);

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

    // Create properly typed verse data
    const verseData: VerseData = {
      reference: verse,
      text: verseText,
    };

    return NextResponse.json({
      passages: [verseData.text],
      query: verseData.reference,
    });
  } catch (error: unknown) {
    // Log the detail server-side; never echo internals to the client.
    console.error("Error fetching verse:", error);
    return NextResponse.json(
      { error: "Failed to fetch verse. Please try again." },
      { status: 500 }
    );
  }
}
