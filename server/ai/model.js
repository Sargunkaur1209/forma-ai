import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOllama } from '@langchain/ollama';

const DEFAULT_GOOGLE_MODEL = 'gemini-3.7-flash';
const DEFAULT_OLLAMA_MODEL = 'llama3.1:8b';

// The only file that knows which LLM provider is used.
// LLM_PROVIDER in .env selects "google" (default) or "ollama".
export function getModel(options = {}) {
  const provider = process.env.LLM_PROVIDER || 'google';

  if (provider === 'ollama') {
    return new ChatOllama({
      model: process.env.LLM_MODEL || DEFAULT_OLLAMA_MODEL,
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      temperature: 0,
      ...options,
    });
  }

  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not set');
  }
  return new ChatGoogleGenerativeAI({
    model: process.env.LLM_MODEL || DEFAULT_GOOGLE_MODEL,
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0, // extraction should be deterministic
    maxRetries: 0, // our own withRetry.js handles retries
    ...options,
  });
}
