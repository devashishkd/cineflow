import jwt from 'jsonwebtoken';

/**
 * JWT Auth Middleware
 *
 * Checks the Authorization header for a Bearer token.
 * If valid, sets req.user = { userId, email, name } and calls next().
 * If invalid or missing, returns 401.
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
    req.user = decoded; // { userId, email, name, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

export default authMiddleware;
