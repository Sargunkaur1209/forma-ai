import { Router } from 'express';
import FormSchema from '../models/FormSchema.js';
import Extraction from '../models/Extraction.js';
import { extractClaim } from '../ai/extractClaim.js';

const router = Router();

const FORM_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_STORY_LENGTH = 2000;

function currentModelInfo() {
  return {
    provider: process.env.LLM_PROVIDER || 'google',
    model: process.env.LLM_MODEL || 'unknown',
  };
}

// Logging the extraction is best-effort: a logging failure must never
// break the response the user is waiting on.
async function logExtraction(entry) {
  try {
    await Extraction.create(entry);
  } catch (err) {
    console.error('Failed to log extraction:', err.message);
  }
}

router.post('/', async (req, res) => {
  const { formId, story } = req.body ?? {};

  if (typeof formId !== 'string' || !FORM_ID_PATTERN.test(formId)) {
    return res.status(400).json({ error: 'Invalid or missing formId' });
  }
  if (typeof story !== 'string' || !story.trim()) {
    return res.status(400).json({ error: 'Missing story' });
  }
  if (story.length > MAX_STORY_LENGTH) {
    return res.status(400).json({ error: `Story is longer than ${MAX_STORY_LENGTH} characters` });
  }

  // The schema always comes from the database, never from the client.
  const form = await FormSchema.findOne({ formId }).sort({ version: -1 }).lean();
  if (!form) {
    return res.status(404).json({ error: `Form "${formId}" not found` });
  }

  const { provider, model } = currentModelInfo();
  const startedAt = Date.now();

  try {
    const { answers, confidence, missing, rejected } = await extractClaim(form, story);
    const durationMs = Date.now() - startedAt;

    await logExtraction({
      formId: form.formId,
      formVersion: form.version,
      story,
      provider,
      model,
      status: 'success',
      durationMs,
      answers,
      confidence,
      missing,
      rejected,
    });

    res.json({ formId: form.formId, version: form.version, answers, confidence, missing, rejected });
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    console.error('Extraction failed:', err.message);

    await logExtraction({
      formId: form.formId,
      formVersion: form.version,
      story,
      provider,
      model,
      status: 'failure',
      durationMs,
      errorMessage: err.message.slice(0, 500),
    });

    const body = { error: 'Extraction failed. Please try again.' };
    if (process.env.NODE_ENV !== 'production') body.detail = err.message.slice(0, 400);
    res.status(502).json(body);
  }
});

export default router;
