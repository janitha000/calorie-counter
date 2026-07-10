import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const MODEL_PRIORITY = [
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
];

/**
 * Attempts to generate content using the model priority chain.
 * Falls through to the next model on any error (rate limit, 404, etc).
 * @param {string | Array} prompt - A text prompt string, or an array of parts (for multimodal).
 * @returns {Promise<string>} - The raw response text.
 */
export async function generateWithFallback(prompt) {
  let lastError;

  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log(`✓ AI responded using: ${modelName}`);
      return text;
    } catch (err) {
      console.warn(`✗ Model "${modelName}" failed: ${err?.message?.slice(0, 120)}`);
      lastError = err;
    }
  }

  throw new Error(`All AI models exhausted. Last error: ${lastError?.message}`);
}

/** Helper to strip markdown fences and parse JSON from AI response text. */
export function parseAIJson(text) {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}
