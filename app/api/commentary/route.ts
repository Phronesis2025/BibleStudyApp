import { NextResponse } from "next/server";
import OpenAI from "openai";

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

// Fallback commentary template
const getFallbackCommentary = (verse: string, content: string) => {
  return `Commentary on ${verse}:

1. Brief commentary:
This verse speaks about God's love for humanity and the gift of eternal life through faith in Jesus Christ.

2. Practical application:
This verse reminds us of God's immense love and encourages us to share this message of hope with others.

3. Key themes:
- God's love
- Salvation
- Eternal life
- Faith

4. Discussion questions:
- How does this verse impact your understanding of God's love?
- What does it mean to "believe in Him" in your daily life?

Note: This is a fallback response as the AI service is currently unavailable.`;
};

export async function POST(req: Request) {
  try {
    const { verse, content } = await req.json();

    const prompt = `
Given the Bible verse "${verse}":

${content}

Please provide:
1. A 100-150 word commentary explaining the meaning of the verse in its biblical context.
2. A 50-100 word real-life application connecting the verse to a modern, relatable scenario.
3. Exactly three single-word themes that capture the main concepts in this verse (e.g., "faith", "love", "redemption"). Each theme should be one word only.
4. Two reflective questions that encourage personal pondering related to the verse's meaning and modern application.

Format the response as a JSON object with these keys:
{
  "commentary": "...",
  "application": "...",
  "themes": ["word1", "word2", "word3"],
  "questions": ["...", "..."]
}
`;

    const completion = await openai.chat.completions.create({
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

    // Validate themes are single words
    const validatedThemes = data.themes.map(
      (theme: string) => theme.trim().split(/\s+/)[0] // Take only the first word if multiple words are returned
    );
    data.themes = validatedThemes;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error generating commentary:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate commentary" },
      { status: 500 }
    );
  }
}
