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

// Define the allowed themes list
const allowedThemes = [
  "faith",
  "love",
  "hope",
  "grace",
  "mercy",
  "peace",
  "wisdom",
  "truth",
  "salvation",
  "righteousness",
  "joy",
  "forgiveness",
  "obedience",
  "humility",
  "trust",
  "prayer",
  "service",
  "holiness",
  "redemption",
  "eternity",
  "teaching",
  "accountability",
];

// Theme mapping for common mismatches
const themeMapping: Record<string, string> = {
  "god's": "faith",
  faithfulness: "faith",
  guidance: "wisdom",
  "trust in god": "trust",
  "divine guidance": "wisdom",
  salvation: "salvation",
  "eternal life": "eternity",
  forgiveness: "forgiveness",
  "holy spirit": "faith",
  "god's love": "love",
  "god's mercy": "mercy",
  "god's grace": "grace",
  patience: "peace",
  kindness: "love",
  "self-control": "obedience",
  perseverance: "hope",
  "spiritual growth": "holiness",
  testimony: "faith",
  worship: "faith",
  evangelism: "service",
  discipleship: "teaching",
  repentance: "forgiveness",
  fellowship: "love",
  stewardship: "service",
  creation: "faith",
  providence: "trust",
};

// Log all environment variables (excluding sensitive data)
console.log("Environment check:", {
  hasOpenAIKey: !!process.env.OPENAI_API_KEY,
  openAIKeyLength: process.env.OPENAI_API_KEY?.length,
  openAIKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10),
  nodeEnv: process.env.NODE_ENV,
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env.OPENAI_API_KEY");
}

// Log the API key (first few characters only for security)
console.log(
  "OpenAI API Key:",
  process.env.OPENAI_API_KEY.substring(0, 10) + "..."
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to map a theme to an allowed theme
function mapToAllowedTheme(theme: string): string {
  const lowerTheme = theme.toLowerCase().trim();

  // Check if theme is already in allowed list
  if (allowedThemes.includes(lowerTheme)) {
    return lowerTheme;
  }

  // Check if theme is in our mapping
  if (themeMapping[lowerTheme]) {
    return themeMapping[lowerTheme];
  }

  // Check if theme starts with any allowed theme
  for (const allowed of allowedThemes) {
    if (lowerTheme.startsWith(allowed)) {
      return allowed;
    }
  }

  // Default to "faith" if no match found
  return "faith";
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { verse, content } = body;

    if (!verse) {
      return NextResponse.json(
        { error: "Verse reference is required" },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Verse content is required" },
        { status: 400 }
      );
    }

    const prompt = `
Given the Bible verse "${verse}":

${content}

Please provide a detailed analysis using the "Reading it Right" method, including historical context, denominational perspectives, and a reflective question. Format the response as a JSON object with the following structure:

{
  "historical_context": "A 50-75 word overview of the historical, cultural, and social context of the verse's timeframe, including location, political climate, key figures/events, and cultural/religious practices.",
  
  "commentary": {
    "summarize": "25-50 word summary of the verse's basic teaching in biblical context",
    "expose": "25-50 word explanation of how the verse evaluates our lives",
    "change": "25-50 word description of specific adjustments to make",
    "prepare": "25-50 word reflection on spiritual maturity and God's plan"
  },
  
  "application": "50-100 word real-life application connecting the verse to modern scenarios",
  
  "denominational_perspectives": {
    "protestant": "50-75 word Protestant perspective emphasizing scripture",
    "baptist": "50-75 word Baptist perspective focusing on personal faith",
    "catholic": "50-75 word Catholic perspective integrating tradition"
  },
  
  "themes": ["2-3 key themes"],
  
  "questions": ["One deep, reflective question aligned with the Reading it Right method"]
}

IMPORTANT: For the "themes" field, you MUST ONLY use themes from this specific list: faith, love, hope, grace, mercy, peace, wisdom, truth, salvation, righteousness, joy, forgiveness, obedience, humility, trust, prayer, service, holiness, redemption, eternity, teaching, accountability. Do not use any themes not on this list.

Ensure the response maintains a reflective, encouraging tone with clear, accessible language.`;

    const completion: OpenAIResponse = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    const data = JSON.parse(response);

    // Process themes to ensure they are from the allowed list
    let processedThemes: string[] = [];

    if (Array.isArray(data.themes)) {
      // Limit to 3 themes maximum
      const themesToProcess = data.themes.slice(0, 3);

      // Map each theme to an allowed theme
      processedThemes = themesToProcess.map(mapToAllowedTheme);

      // Remove duplicates if any
      processedThemes = [...new Set(processedThemes)];

      // Ensure we have at least one theme
      if (processedThemes.length === 0) {
        processedThemes = ["faith"];
      }
    } else {
      // Default if no themes were returned
      processedThemes = ["faith"];
    }

    console.log("Original themes:", data.themes);
    console.log("Processed themes:", processedThemes);

    // Format the response to match the new frontend expectations
    const formattedResponse = {
      historical_context: data.historical_context,
      commentary: data.commentary,
      application: data.application,
      denominational_perspectives: data.denominational_perspectives,
      themes: processedThemes,
      questions: data.questions,
    };

    return NextResponse.json(formattedResponse);
  } catch (error: unknown) {
    console.error("Error generating commentary:", error);

    // Return a more specific error message
    const errorMessage =
      error instanceof Response
        ? error.statusText
        : error instanceof Error
        ? error.message
        : "Failed to generate commentary";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}

// Removing the unused function declaration or commenting it out
// If this function might be used in the future, keep it commented
// const getFallbackCommentary = (content: string) => {
//   // Implementation here
// };
