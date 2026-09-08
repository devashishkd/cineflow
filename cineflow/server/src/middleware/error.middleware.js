import { AppError } from '../utils/errors.js';

/**
 * Global error handling middleware.
 */
const errorMiddleware = (err, req, res, next) => {
  // Log unexpected errors
  if (!err.statusCode || err.statusCode >= 500) {
    console.error('[Error Middleware]', err);
  }

  // Typed app errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ success: false, message: messages });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format for field '${err.path}'`,
    });
  }

  // Generic fallback
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

export default errorMiddleware;
