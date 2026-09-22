import { Router } from 'express';
import FormSchema from '../models/FormSchema.js';

const router = Router();

const FORM_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

// Express 5 forwards errors from async handlers automatically,
// so no try/catch is needed here for unexpected errors.
router.get('/:formId', async (req, res) => {
  const { formId } = req.params;

  if (!FORM_ID_PATTERN.test(formId)) {
    return res.status(400).json({ error: 'Invalid formId' });
  }

  // Highest version wins, as the schema contract says.
  const form = await FormSchema.findOne({ formId })
    .sort({ version: -1 })
    .select('formId title version sections -_id')
    .lean();

  if (!form) {
    return res.status(404).json({ error: `Form "${formId}" not found` });
  }

  res.json(form);
});

router.post('/', async (req, res) => {
  const { formId, title, sections } = req.body ?? {};

  if (typeof formId !== 'string' || !FORM_ID_PATTERN.test(formId)) {
    return res.status(400).json({ error: 'Invalid or missing formId' });
  }
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Missing title' });
  }

  // Auto-assign the next version so a client can never overwrite an existing one.
  const latest = await FormSchema.findOne({ formId })
    .sort({ version: -1 })
    .select('version')
    .lean();
  const version = (latest?.version ?? 0) + 1;

  try {
    const doc = new FormSchema({ formId, title, version, sections });
    await doc.save();
    res.status(201).json({
      formId: doc.formId,
      title: doc.title,
      version: doc.version,
      sections: doc.sections,
    });
  } catch (err) {
    if (err.name === 'SchemaValidationError') {
      return res.status(400).json({ error: 'Invalid schema', details: err.details });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Invalid schema',
        details: Object.values(err.errors).map((e) => e.message),
      });
    }
    throw err; // unexpected error -> Express 5's default 500 handler
  }
});

export default router;