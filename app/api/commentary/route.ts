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
  // Faith-related themes
  "god's": "faith",
  faithfulness: "faith",
  belief: "faith",
  believing: "faith",
  strength: "faith",
  confidence: "faith",
  "holy spirit": "faith",
  providence: "faith",
  creation: "faith",
  creator: "faith",
  testimony: "faith",
  worship: "faith",

  // Trust-related themes
  "trust in god": "trust",
  empowerment: "trust",
  reliance: "trust",
  dependence: "trust",
  "confidence in god": "trust",

  // Wisdom-related themes
  guidance: "wisdom",
  "divine guidance": "wisdom",
  understanding: "wisdom",
  knowledge: "wisdom",
  discernment: "wisdom",
  insight: "wisdom",
  direction: "wisdom",

  // Love-related themes
  "god's love": "love",
  kindness: "love",
  fellowship: "love",
  charity: "love",

  // Mercy-related themes
  "god's mercy": "mercy",
  compassion: "mercy",

  // Grace-related themes
  "god's grace": "grace",
  "unmerited favor": "grace",

  // Peace-related themes
  patience: "peace",
  tranquility: "peace",
  rest: "peace",
  contentment: "peace",

  // Hope-related themes
  perseverance: "hope",
  endurance: "hope",
  future: "hope",
  expectation: "hope",
  promise: "hope",

  // Other specific mappings
  salvation: "salvation",
  "eternal life": "eternity",
  forgiveness: "forgiveness",
  repentance: "forgiveness",
  "self-control": "obedience",
  "spiritual growth": "holiness",
  evangelism: "service",
  discipleship: "teaching",
  stewardship: "service",
  courage: "faith",
  joy: "joy",
  rejoicing: "joy",
  discipline: "obedience",
  following: "obedience",
  meekness: "humility",
  gentleness: "humility",
  intercession: "prayer",
  petition: "prayer",
  ministry: "service",
  helping: "service",
  purity: "holiness",
  sanctification: "holiness",
  atonement: "redemption",
  deliverance: "redemption",
  eternity: "eternity",
  heaven: "eternity",
  instruction: "teaching",
  learning: "teaching",
  responsibility: "accountability",
};

// Default themes to use if we need to ensure exactly 3 themes
const defaultThemes = ["faith", "hope", "trust"];

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
function mapToAllowedTheme(theme: string, usedThemes: string[] = []): string {
  const lowerTheme = theme.toLowerCase().trim();

  // Check if theme is already in allowed list
  if (allowedThemes.includes(lowerTheme) && !usedThemes.includes(lowerTheme)) {
    return lowerTheme;
  }

  // Check if theme is in our mapping
  if (themeMapping[lowerTheme]) {
    const mappedTheme = themeMapping[lowerTheme];

    // If the mapped theme is already used, try to find a more relevant alternative
    if (usedThemes.includes(mappedTheme)) {
      console.log(
        `Mapped theme '${lowerTheme}' to '${mappedTheme}' but it's already used. Finding alternative...`
      );

      // Alternative mappings for common themes
      const alternativeMappings: Record<string, string[]> = {
        faith: ["trust", "wisdom", "hope"],
        trust: ["faith", "wisdom", "prayer"],
        strength: ["faith", "trust", "wisdom", "prayer"],
        confidence: ["faith", "trust", "wisdom"],
        empowerment: ["trust", "faith", "wisdom"],
        love: ["mercy", "grace", "joy"],
        kindness: ["love", "mercy", "grace"],
        hope: ["faith", "trust", "peace"],
        wisdom: ["truth", "faith", "discernment"],
      };

      // Check if we have alternatives for this theme
      if (alternativeMappings[lowerTheme]) {
        // Try each alternative in order until we find one that's not used
        for (const alt of alternativeMappings[lowerTheme]) {
          if (!usedThemes.includes(alt)) {
            console.log(
              `Found alternative mapping: '${lowerTheme}' -> '${alt}'`
            );
            return alt;
          }
        }
      }

      // If no specific alternatives or all are used, try general fallbacks
      const generalFallbacks = [
        "wisdom",
        "prayer",
        "peace",
        "joy",
        "service",
        "hope",
      ];
      for (const fallback of generalFallbacks) {
        if (!usedThemes.includes(fallback)) {
          console.log(
            `Using general fallback: '${lowerTheme}' -> '${fallback}'`
          );
          return fallback;
        }
      }
    }

    console.log(`Mapped theme '${lowerTheme}' to '${mappedTheme}'`);
    return mappedTheme;
  }

  // Check if theme starts with any allowed theme
  for (const allowed of allowedThemes) {
    if (lowerTheme.startsWith(allowed) && !usedThemes.includes(allowed)) {
      console.log(
        `Partial match: Mapped theme '${lowerTheme}' to '${allowed}'`
      );
      return allowed;
    }
  }

  // If no mapping found, try to find an unused fallback theme
  const fallbacks = ["wisdom", "prayer", "peace", "joy", "service", "hope"];
  for (const fallback of fallbacks) {
    if (!usedThemes.includes(fallback)) {
      console.log(
        `Warning: Theme not in allowed list or mapping: '${lowerTheme}'. Using fallback '${fallback}'`
      );
      return fallback;
    }
  }

  // If all fallbacks are used (unlikely), default to hope
  console.log(
    `Warning: Theme not in allowed list or mapping: '${lowerTheme}'. All fallbacks used, defaulting to 'hope'`
  );
  return "hope";
}

// Helper function to ensure exactly 3 unique themes
function ensureExactlyThreeThemes(themes: string[]): string[] {
  // Track used themes to avoid duplicates
  const usedThemes: string[] = [];

  // Map themes to allowed themes while avoiding duplicates
  const mappedThemes = themes.map((theme) => {
    const mappedTheme = mapToAllowedTheme(theme, usedThemes);
    console.log(
      `Mapping theme: ${theme} to: ${mappedTheme} Used themes:`,
      usedThemes
    );
    usedThemes.push(mappedTheme);
    return mappedTheme;
  });

  // Remove any potential duplicates (should be none after our mapping logic)
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
1. You MUST ONLY return themes that are in the following list: faith, love, hope, grace, mercy, peace, wisdom, truth, salvation, righteousness, joy, forgiveness, obedience, humility, trust, prayer, service, holiness, redemption, eternity, teaching, accountability. Do not return any other themes, even if you think they are relevant.

2. Analyze the verse and its content to determine the 3 themes from this list that best reflect its meaning. 

3. Examples of appropriate theme selection:
   - For Philippians 4:13 ("I can do all things through him who strengthens me"), choose themes like faith, trust, and wisdom because they align with reliance on Christ's strength and seeking His guidance.
   - For Proverbs 3:5-6 ("Trust in the LORD with all your heart..."), choose themes like trust, wisdom, and faith because they align with the verse's focus on trusting God and seeking His wisdom.
   - For John 3:16 ("For God so loved the world..."), choose themes like love, salvation, and faith because they align with God's love and the salvation offered through faith in Christ.

4. Under NO circumstances should you return themes that are not in the list. For example, do not return themes like 'strength', 'empowerment', 'confidence', or 'perseverance' — instead, choose the closest matching theme from the list, such as 'faith', 'trust', or 'wisdom'.

5. You MUST provide EXACTLY 3 themes - no more, no less.
6. Themes MUST be lowercase and ONLY from the list provided above.
7. Double-check your themes before returning them to ensure they come ONLY from the provided list.
8. If you're unsure which themes to choose, prefer faith, trust, and wisdom as they are broadly applicable.

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

    console.log(
      "OpenAI returned themes:",
      data.themes,
      "Processed to:",
      processedThemes
    );

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
