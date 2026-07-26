import jwt from 'jsonwebtoken';

/**
 * Shared JWT verification helper.
 *
 * Each service imports this instead of duplicating jwt.verify() logic.
 * Stateless — reads JWT_SECRET from env, no DB call needed.
 *
 * Returns the decoded payload: { userId, email, name }
 * Throws if token is missing, malformed, or expired.
 */
const verifyToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
};

/**
 * Express middleware wrapper around verifyToken.
 * Attach this to any route that requires authentication.
 */
const authMiddleware = (req, res, next) => {
  try {
    req.user = verifyToken(req.headers['authorization']);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

export { verifyToken, authMiddleware };
