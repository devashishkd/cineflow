import { AppError } from '../utils/errors.js';

/**
 * Global error handling middleware.
 * Must be registered LAST in app.js (after all routes).
 *
 * Handles:
 *  - AppError subclasses (NotFoundError, ValidationError, AuthError, etc.)
 *  - Sequelize validation errors
 *  - Unexpected errors (500)
 */
const errorMiddleware = (err, req, res, next) => {
  // Log unexpected errors
  if (!err.statusCode || err.statusCode >= 500) {
    console.error('[Error Middleware]', err);
  }

  // Typed app errors (NotFoundError, ValidationError, etc.)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Sequelize unique constraint violation
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
    });
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message).join(', ');
    return res.status(400).json({ success: false, message: messages });
  }

  // Generic fallback
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

export default errorMiddleware;
