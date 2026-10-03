import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import formsRouter from './routes/forms.js';
import llmTestRouter from './routes/llmTest.js';
import extractRouter from './routes/extract.js';
import extractionsRouter from './routes/extractions.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: '100kb' }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});
app.use('/api/forms', formsRouter);
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/llm-test', llmTestRouter);
}
app.use('/api/extract', extractRouter);
app.use('/api/extractions', extractionsRouter);

export default app;
