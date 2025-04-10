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

// Default themes to use if we need to ensure exactly 3 themes
const defaultThemes = ["faith", "love", "hope"];

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

// Helper function to ensure exactly 3 unique themes
function ensureExactlyThreeThemes(themes: string[]): string[] {
  // Map themes to allowed themes
  const mappedThemes = themes.map(mapToAllowedTheme);

  // Remove duplicates
  const uniqueThemes = [...new Set(mappedThemes)];

  // If we have exactly 3 themes, return them
  if (uniqueThemes.length === 3) {
    return uniqueThemes;
  }

  // If we have more than 3, take the first 3
  if (uniqueThemes.length > 3) {
    return uniqueThemes.slice(0, 3);
  }

  // If we have less than 3, add default themes that aren't already included
  const result = [...uniqueThemes];
  let defaultIndex = 0;

  while (result.length < 3 && defaultIndex < defaultThemes.length) {
    const defaultTheme = defaultThemes[defaultIndex];
    if (!result.includes(defaultTheme)) {
      result.push(defaultTheme);
    }
    defaultIndex++;
  }

  // If we still don't have 3 themes (unlikely but possible),
  // add themes from allowedThemes that aren't already included
  let allowedIndex = 0;
  while (result.length < 3 && allowedIndex < allowedThemes.length) {
    const allowedTheme = allowedThemes[allowedIndex];
    if (!result.includes(allowedTheme)) {
      result.push(allowedTheme);
    }
    allowedIndex++;
  }

  return result;
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
  
  "themes": ["exactly 3 key themes that are the most relevant to the verse's meaning and context"],
  
  "questions": ["One deep, reflective question aligned with the Reading it Right method"]
}

IMPORTANT INSTRUCTIONS FOR THEMES:
1. Analyze the verse and its content to determine the 3 themes that best reflect its meaning. 
2. For example, for Proverbs 3:5-6 ("Trust in the LORD with all your heart..."), choose themes like trust, wisdom, and faith because they align with the verse's focus on trusting God and seeking His wisdom.
3. You MUST provide EXACTLY 3 themes - no more, no less.
4. Themes MUST be lowercase and ONLY from this specific list: faith, love, hope, grace, mercy, peace, wisdom, truth, salvation, righteousness, joy, forgiveness, obedience, humility, trust, prayer, service, holiness, redemption, eternity, teaching, accountability. 
5. DO NOT return themes outside this list.
6. DO NOT return fewer or more than 3 themes.

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
    // and that we have exactly 3 of them
    let processedThemes: string[] = [];

    if (Array.isArray(data.themes)) {
      // Ensure we have exactly 3 themes from the allowed list
      processedThemes = ensureExactlyThreeThemes(data.themes);
    } else {
      // Default if no themes were returned
      processedThemes = [...defaultThemes];
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
