import { GoogleGenerativeAI } from "@google/generative-ai";

type AIResponse = {
  missing_skills: string[];
  improvements: string[];
  rewritten_summary: string;
};

const DEFAULT_MODEL = "gemini-1.5-flash";

let client: GoogleGenerativeAI | null = null;

function getGeminiClient() {
  if (client) {
    return client;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  client = new GoogleGenerativeAI(apiKey);
  return client;
}

export async function generateAI(prompt: string): Promise<AIResponse> {
  const model = getGeminiClient().getGenerativeModel({
    model: DEFAULT_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  });

  const result = await model.generateContent(`
You are an ATS resume assistant.

Return valid JSON only with this exact shape:
{
  "missing_skills": ["string"],
  "improvements": ["string"],
  "rewritten_summary": "string"
}

Rules:
- "missing_skills" must be an array of short skill phrases.
- "improvements" must be an array of concise actionable suggestions.
- "rewritten_summary" must be a polished professional summary paragraph.
- Do not include markdown fences.

Prompt:
${prompt}
`);

  const rawText = result.response.text();
  return parseAIResponse(rawText);
}

function parseAIResponse(rawText: string): AIResponse {
  const normalizedText = rawText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(normalizedText) as Partial<AIResponse>;

    return {
      missing_skills: sanitizeStringArray(parsed.missing_skills),
      improvements: sanitizeStringArray(parsed.improvements),
      rewritten_summary:
        typeof parsed.rewritten_summary === "string"
          ? parsed.rewritten_summary.trim()
          : "",
    };
  } catch {
    return {
      missing_skills: [],
      improvements: [],
      rewritten_summary: "",
    };
  }
}

function sanitizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}
