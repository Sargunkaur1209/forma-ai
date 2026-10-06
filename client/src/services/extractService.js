const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

/**
 * POST /api/extract
 * Sends the user's story to the backend and returns { answers, confidence, missing, rejected, formId, version }.
 */
export async function extractFromStory(story, formId) {
  if (!API_URL) {
    throw new Error('VITE_API_URL is not configured');
  }

  const response = await fetch(`${API_URL}/api/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ story, formId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? `Extraction failed (${response.status})`);
  }

  return data; // { formId, version, answers, confidence, missing, rejected }
}
