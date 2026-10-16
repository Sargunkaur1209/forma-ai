export class ClaimApiError extends Error {
  constructor(message, { status = null, details = [], network = false } = {}) {
    super(message);
    this.name = 'ClaimApiError';
    this.status = status;
    this.details = details;
    this.network = network;
  }
}

function getUrl(path) {
  const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
  if (!apiUrl) throw new Error('VITE_API_URL is not configured');
  return `${apiUrl}${path}`;
}

async function request(path, options) {
  let response;

  try {
    response = await fetch(getUrl(path), options);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ClaimApiError('Unable to reach the server. Check your connection and try again.', {
        network: true,
      });
    }
    throw error;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new ClaimApiError(data.error ?? `The server returned an error (${response.status}).`, {
      status: response.status,
      details: Array.isArray(data.details) ? data.details : [],
    });
  }

  return data;
}

function jsonRequest(method, body) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

/** POST /api/drafts */
export function createDraft(payload) {
  return request('/api/drafts', jsonRequest('POST', payload));
}

/** PUT /api/drafts/:id */
export function updateDraft(id, payload) {
  return request(`/api/drafts/${encodeURIComponent(id)}`, jsonRequest('PUT', payload));
}

/** GET /api/drafts/:id */
export function fetchDraft(id) {
  return request(`/api/drafts/${encodeURIComponent(id)}`);
}

/** GET /api/drafts?formId=:formId */
export async function fetchDrafts(formId) {
  const data = await request(`/api/drafts?formId=${encodeURIComponent(formId)}`);
  if (!Array.isArray(data.drafts) || !Number.isInteger(data.count)) {
    throw new ClaimApiError('The server returned an invalid drafts response.');
  }
  return data;
}

export const fetchRecentDrafts = fetchDrafts;

/** POST /api/submissions */
export function submitClaim(payload) {
  return request('/api/submissions', jsonRequest('POST', payload));
}
