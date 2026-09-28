const RETRYABLE_STATUS = new Set([429, 503]);
const NETWORK_CODES = new Set(['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN']);
const MAX_WAIT_MS = 30_000;

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// LangChain/Gemini errors carry the status in the message, e.g. "[429 Too Many Requests]".
function statusOf(err) {
  if (typeof err?.status === 'number') return err.status;
  const match = /\[(\d{3})\b/.exec(err?.message ?? '');
  return match ? Number(match[1]) : undefined;
}

export function isRetryable(err) {
  return RETRYABLE_STATUS.has(statusOf(err)) || NETWORK_CODES.has(err?.code);
}

// Google tells us how long to wait: "Please retry in 18.96s".
function hintedDelayMs(err) {
  const match = /retry in ([\d.]+)s/i.exec(err?.message ?? '');
  return match ? Math.ceil(Number(match[1]) * 1000) + 500 : undefined;
}

/**
 * Runs fn(), retrying only on rate limits, overload and network errors.
 * Other errors (bad request, missing key) fail immediately.
 */
export async function withRetry(fn, { attempts = 3, sleep = defaultSleep } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= attempts || !isRetryable(err)) throw err;
      const wait = Math.min(hintedDelayMs(err) ?? 2000 * attempt, MAX_WAIT_MS);
      await sleep(wait);
    }
  }
}
