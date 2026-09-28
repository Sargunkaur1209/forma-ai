import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const DEFAULT_MODEL = 'gemini-3.7-flash';

// The only file that knows which LLM provider is used.
// To switch provider later, change this function and .env.
export function getModel(options = {}) {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not set');
  }
  return new ChatGoogleGenerativeAI({
    model: process.env.LLM_MODEL || DEFAULT_MODEL,
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0, // extraction should be deterministic
    maxRetries: 0,
    ...options,
  });
}
