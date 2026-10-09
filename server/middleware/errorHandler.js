function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode =
    Number.isInteger(err.statusCode) && err.statusCode >= 400 && err.statusCode < 600
      ? err.statusCode
      : Number.isInteger(err.status) && err.status >= 400 && err.status < 600
        ? err.status
        : 500;

  if (statusCode >= 500) {
    console.error('Request failed:', {
      method: req.method,
      path: req.path,
      statusCode,
      message: err.message,
    });
  }

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal server error' : err.message,
  });
}

export default errorHandler;
