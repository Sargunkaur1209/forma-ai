import { Router } from 'express';
import Extraction from '../models/Extraction.js';

const router = Router();
const MAX_LIMIT = 100;

// Lists recent extraction log entries, newest first. No auth yet — see
// docs/api-notes.md (POST /api/forms note) for the same caveat; this will
// need an admin key before deployment (Day 21).
router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, MAX_LIMIT);
  const formId = typeof req.query.formId === 'string' ? req.query.formId : undefined;

  const filter = formId ? { formId } : {};
  const entries = await Extraction.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-__v')
    .lean();

  res.json({ entries, count: entries.length });
});

export default router;
