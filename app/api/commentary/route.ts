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
You are a Bible scholar providing commentary on a given verse. Provide the following in a structured JSON format:

- "general_meaning": A concise explanation (2-3 sentences) of the verse's meaning in simple language.
- "historical_context": A brief historical context (2-3 sentences) of the verse.
- "denominational_perspectives": A short explanation (2-3 sentences) of how different Christian denominations might interpret the verse.
- "application": A practical application (2-3 sentences) of the verse for a modern reader.
- "key_themes": Exactly 3 key themes relevant to the verse, as an array of strings (e.g., ["faith", "love", "hope"]).
- "reflective_question": A short, simple, thought-provoking question (1 sentence) for the user to ponder, focused on personal application or open-ended reflection (e.g., "How can this verse bring you peace today?").

Use only the following themes in your key_themes array: faith, love, hope, grace, mercy, peace, wisdom, truth, salvation, righteousness, joy, forgiveness, obedience, humility, trust, prayer, service, holiness, redemption, eternity, teaching, accountability.

Verse: ${verse}
Content: ${content}
`;

    console.log("Sending request to OpenAI for verse:", verse);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }

    console.log(
      "Received response from OpenAI:",
      responseContent.substring(0, 100) + "..."
    );

    let commentary;
    try {
      commentary = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      throw new Error("Failed to parse OpenAI response");
    }

    // Ensure all expected properties exist
    const defaultCommentary = {
      general_meaning:
        "This verse speaks to God's wisdom and guidance for our lives.",
      historical_context:
        "Written in a time when faith was central to daily life.",
      commentary: {
        summarize: "The verse summarizes a core teaching of the Bible.",
        expose: "It exposes our need for divine guidance.",
        change: "We should align our actions with this teaching.",
        prepare: "This prepares us for spiritual growth.",
      },
      application:
        "We can apply this by reflecting on how it impacts our daily decisions.",
      denominational_perspectives: {
        protestant:
          "Protestants emphasize personal interpretation of this verse.",
        baptist:
          "Baptists focus on personal faith in relation to this teaching.",
        catholic:
          "Catholics integrate church tradition in understanding this verse.",
      },
      key_themes: ["faith", "wisdom", "trust"],
      reflective_question:
        "How might this verse change your perspective today?",
    };

    // Merge with defaults for any missing properties
    const mergedCommentary = {
      ...defaultCommentary,
      ...commentary,
      // Ensure nested objects exist
      commentary: {
        ...defaultCommentary.commentary,
        ...(commentary.commentary || {}),
      },
      denominational_perspectives: {
        ...defaultCommentary.denominational_perspectives,
        ...(commentary.denominational_perspectives || {}),
      },
    };

    // Process themes to ensure they are from the allowed list
    // and that we have exactly 3 of them
    let processedThemes: string[] = [];

    if (Array.isArray(mergedCommentary.key_themes)) {
      // Ensure we have exactly 3 themes from the allowed list
      processedThemes = ensureExactlyThreeThemes(mergedCommentary.key_themes);
    } else {
      // Default if no themes were returned
      processedThemes = [...defaultThemes];
    }

    console.log(
      "OpenAI returned themes:",
      mergedCommentary.key_themes,
      "Processed to:",
      processedThemes
    );

    // Format the response to match the frontend expectations
    const formattedResponse = {
      historical_context: mergedCommentary.historical_context,
      general_meaning: mergedCommentary.general_meaning,
      commentary: mergedCommentary.commentary,
      application: mergedCommentary.application,
      denominational_perspectives: mergedCommentary.denominational_perspectives,
      themes: processedThemes,
      reflective_question:
        mergedCommentary.reflective_question ||
        defaultCommentary.reflective_question,
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

    const fallbackResponse = {
      historical_context: "Context information is currently unavailable.",
      general_meaning: "This verse contains important spiritual guidance.",
      commentary: {
        summarize: "The verse contains key biblical teachings.",
        expose: "It shows us areas where we need growth.",
        change: "We can apply these principles daily.",
        prepare: "This helps us prepare for spiritual maturity.",
      },
      application:
        "We can apply this verse by reflecting on its meaning in our daily lives.",
      denominational_perspectives: {
        protestant:
          "Protestants emphasize scripture alone in understanding this.",
        baptist:
          "Baptists focus on personal faith in relation to this teaching.",
        catholic:
          "Catholics integrate church tradition in understanding this verse.",
      },
      themes: ["faith", "wisdom", "trust"],
      reflective_question: "How might this verse guide your decisions today?",
      error: errorMessage,
    };

    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}

// Removing the unused function declaration or commenting it out
// If this function might be used in the future, keep it commented
// const getFallbackCommentary = (content: string) => {
//   // Implementation here
// };
