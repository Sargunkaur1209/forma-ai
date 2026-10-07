import { Router } from 'express';
import mongoose from 'mongoose';
import Draft from '../models/Draft.js';

const router = Router();

const FORM_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_STORY_LENGTH = 2000;

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function formatDraft(doc) {
  return {
    id: doc._id,
    formId: doc.formId,
    formVersion: doc.formVersion,
    story: doc.story ?? null,
    answers: doc.answers ?? {},
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// POST /api/drafts — create a new draft
router.post('/', async (req, res) => {
  const { formId, formVersion, answers, story } = req.body ?? {};

  if (typeof formId !== 'string' || !FORM_ID_PATTERN.test(formId)) {
    return res.status(400).json({ error: 'Invalid or missing formId' });
  }
  if (!Number.isInteger(formVersion) || formVersion < 1) {
    return res.status(400).json({ error: 'Invalid or missing formVersion' });
  }
  if (answers !== undefined && (typeof answers !== 'object' || answers === null || Array.isArray(answers))) {
    return res.status(400).json({ error: 'answers must be a plain object' });
  }
  if (story !== undefined && typeof story !== 'string') {
    return res.status(400).json({ error: 'story must be a string' });
  }
  if (typeof story === 'string' && story.length > MAX_STORY_LENGTH) {
    return res.status(400).json({ error: `story is longer than ${MAX_STORY_LENGTH} characters` });
  }

  const draft = await Draft.create({
    formId,
    formVersion,
    answers: answers ?? {},
    story: story ?? undefined,
  });

  res.status(201).json(formatDraft(draft));
});

// PUT /api/drafts/:id — overwrite answers (and optionally story) of a draft
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { answers, story } = req.body ?? {};

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid draft id' });
  }
  if (answers === undefined || typeof answers !== 'object' || answers === null || Array.isArray(answers)) {
    return res.status(400).json({ error: 'answers must be a plain object' });
  }
  if (story !== undefined && typeof story !== 'string') {
    return res.status(400).json({ error: 'story must be a string' });
  }
  if (typeof story === 'string' && story.length > MAX_STORY_LENGTH) {
    return res.status(400).json({ error: `story is longer than ${MAX_STORY_LENGTH} characters` });
  }

  const update = { answers };
  if (story !== undefined) update.story = story;

  const draft = await Draft.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after', runValidators: true }
  ).lean();

  if (!draft) {
    return res.status(404).json({ error: 'Draft not found' });
  }

  res.json(formatDraft(draft));
});
// GET /api/drafts?formId=xxx — list drafts for a form, newest first
router.get('/', async (req, res) => {
  const { formId } = req.query;

  if (typeof formId !== 'string' || !FORM_ID_PATTERN.test(formId)) {
    return res.status(400).json({ error: 'Invalid or missing formId' });
  }

  const drafts = await Draft.find({ formId })
    .sort({ updatedAt: -1 })
    .select('-__v')
    .lean();

  res.json({
    drafts: drafts.map(formatDraft),
    count: drafts.length,
  });
});

// GET /api/drafts/:id — resume a draft   ← this stays below
// GET /api/drafts/:id — resume a draft
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid draft id' });
  }

  const draft = await Draft.findById(id).lean();
  if (!draft) {
    return res.status(404).json({ error: 'Draft not found' });
  }

  res.json(formatDraft(draft));
});

export default router;
