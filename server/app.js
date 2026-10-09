import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import formsRouter from './routes/forms.js';
import llmTestRouter from './routes/llmTest.js';
import extractRouter from './routes/extract.js';
import extractionsRouter from './routes/extractions.js';
import submissionsRouter from './routes/submissions.js';
import draftsRouter from './routes/drafts.js';
import errorHandler from './middleware/errorHandler.js';
import requestLogger from './middleware/requestLogger.js';
import mongoSanitize from './middleware/mongoSanitize.js';
import apiRateLimiter from './middleware/rateLimiter.js';

const app = express();

app.use(requestLogger);
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: '100kb' }));
app.use(mongoSanitize);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api', apiRateLimiter);

app.use('/api/forms', formsRouter);
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/llm-test', llmTestRouter);
}
app.use('/api/extract', extractRouter);
app.use('/api/extractions', extractionsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/drafts', draftsRouter);

app.use(errorHandler);

export default app;

