import { Router } from 'express';
import FormSchema from '../models/FormSchema.js';

const router = Router();

const FORM_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

// Express 5 forwards errors from async handlers automatically,
// so no try/catch is needed here.
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

export default router;