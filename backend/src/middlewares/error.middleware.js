const AppError = require('../utils/app-error');
const logger = require('../utils/logger');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const requestLogger = (req, _res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.originalUrl,
    userId: req.user?.id || null,
  });
  next();
};

const notFoundHandler = (req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  logger.error('Request failed', {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message,
    details: err.details,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  const payload = { error: message };
  if (err.details) {
    payload.details = err.details;
  }

  res.status(statusCode).json(payload);
};

module.exports = {
  asyncHandler,
  requestLogger,
  notFoundHandler,
  errorHandler,
};
