import { performance } from 'node:perf_hooks';

function requestLogger(req, res, next) {
  const startedAt = performance.now();

  res.on('finish', () => {
    console.log({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(performance.now() - startedAt),
    });
  });

  next();
}

export default requestLogger;
