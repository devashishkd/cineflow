import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

/**
 * JWT Auth Middleware
 *
 * Verifies the Bearer token in the Authorization header.
 * On success sets req.user = { userId, email, name, role } and calls next().
 * On failure returns 401.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    // Check if the userId is a valid MongoDB ObjectId (24-hex string).
    // Rejects old PostgreSQL UUID tokens from before the database migration.
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }

    req.user = decoded;
    req.user.id = userId;
    req.user.userId = userId;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

export default authMiddleware;
