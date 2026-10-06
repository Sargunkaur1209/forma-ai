const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

function getUrl(path) {
  if (!API_URL) throw new Error('VITE_API_URL is not configured');
  return `${API_URL}${path}`;
}

/**
 * POST /api/drafts
 * Creates a new draft and returns the saved document.
 * @param {{ formId: string, formVersion: number, answers?: object, story?: string }} payload
 */
export async function createDraft(payload) {
  const response = await fetch(getUrl('/api/drafts'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? `Failed to save draft (${response.status})`);
  return data; // { id, formId, formVersion, story, answers, status, createdAt, updatedAt }
}

/**
 * PUT /api/drafts/:id
 * Overwrites the answers (and optionally story) of an existing draft.
 * @param {string} id
 * @param {{ answers: object, story?: string }} payload
 */
export async function updateDraft(id, payload) {
  const response = await fetch(getUrl(`/api/drafts/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? `Failed to update draft (${response.status})`);
  return data;
}

/**
 * GET /api/drafts/:id
 * Fetches a saved draft for resuming.
 * @param {string} id
 */
export async function fetchDraft(id) {
  const response = await fetch(getUrl(`/api/drafts/${id}`));
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? `Draft not found (${response.status})`);
  return data;
}
