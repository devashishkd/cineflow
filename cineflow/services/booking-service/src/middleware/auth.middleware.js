import jwt from 'jsonwebtoken';

/**
 * JWT Auth Middleware — same logic as user-service.
 *
 * Each service validates tokens independently (no shared DB lookup).
 * This is standard practice — stateless JWT means any service can verify
 * the token using the shared JWT_SECRET without calling user-service.
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
    req.user = decoded; // { userId, email, name }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

export default authMiddleware;
