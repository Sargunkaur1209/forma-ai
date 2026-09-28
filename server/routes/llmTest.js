import { Router } from 'express';
import { getModel } from '../ai/model.js';

const router = Router();

// Dev-only smoke test. It is not registered when NODE_ENV=production.
router.get('/', async (req, res) => {
  try {
    const reply = await getModel().invoke('Reply with exactly one word: pong');
    res.json({ model: process.env.LLM_MODEL, reply: reply.content });
  } catch (err) {
    // Return only the message so no key or stack trace leaks.
    res.status(502).json({ error: err.message });
  }
});

export default router;
