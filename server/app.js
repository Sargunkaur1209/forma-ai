import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import formsRouter from './routes/forms.js';
import llmTestRouter from './routes/llmTest.js';

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

export default app;