import { Router } from 'express';
import FormSchema from '../models/FormSchema.js';
import Submission from '../models/Submission.js';
import { validateSubmission } from '../services/validateSubmission.js';

const router = Router();

const FORM_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

router.post('/', async (req, res) => {
  const { formId, version, answers } = req.body ?? {};

  if (typeof formId !== 'string' || !FORM_ID_PATTERN.test(formId)) {
    return res.status(400).json({ error: 'Invalid or missing formId' });
  }
  if (!Number.isInteger(version) || version < 1) {
    return res.status(400).json({ error: 'Invalid or missing version' });
  }
  if (typeof answers !== 'object' || answers === null || Array.isArray(answers)) {
    return res.status(400).json({ error: 'Missing or invalid answers' });
  }

  // The exact version the user was filling in, not just the latest â€” an
  // older draft must be validated against the schema it was started with.
  const form = await FormSchema.findOne({ formId, version }).lean();
  if (!form) {
    return res.status(404).json({ error: `Form "${formId}" version ${version} not found` });
  }

  const result = validateSubmission(form, answers);
  if (!result.ok) {
    return res.status(400).json({ error: 'Submission failed validation', details: result.errors });
  }

  const submission = await Submission.create({
    formId: form.formId,
    formVersion: form.version,
    answers: result.answers,
  });

  res.status(201).json({
    id: submission._id,
    formId: submission.formId,
    formVersion: submission.formVersion,
    answers: submission.answers,
    status: submission.status,
    createdAt: submission.createdAt,
  });
});

export default router;
