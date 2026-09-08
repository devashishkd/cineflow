import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './user.model.js';
import { ConflictError, NotFoundError, AuthError } from '../../utils/errors.js';

/**
 * Register a new user.
 *
 * Interview: We use bcrypt with cost factor 10.
 * Cost 10 = ~100ms on modern hardware. High enough to slow brute-force,
 * low enough for good UX. Cost 12+ is used for high-security systems.
 */
export const register = async ({ name, email, password, role = 'USER' }) => {
  const existing = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existing) throw new ConflictError('An account with this email already exists');

  const allowedRoles = ['USER', 'ADMIN', 'THEATRE_MANAGER'];
  const normalizedRole = allowedRoles.includes(role) ? role : 'USER';
  
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: normalizedRole,
  });

  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
};

/**
 * Login and return a signed JWT.
 *
 * Interview: JWT payload includes role so downstream middleware
 * can authorize without a DB round-trip.
 * Trade-off: if role changes, user must re-login.
 * Alternative: opaque session token + DB lookup on every request.
 */
export const login = async ({ email, password }) => {
  // Use 'withPassword' scope to include passwordHash for verification
  const user = await User.scope('withPassword').findOne({ where: { email: email.toLowerCase() } });

  // Same error for "user not found" and "wrong password" — prevents user enumeration
  if (!user) throw new AuthError('Invalid email or password');

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new AuthError('Invalid email or password');

  const token = jwt.sign(
    {
      userId: user.id,
      email:  user.email,
      name:   user.name,
      role:   user.role,         // ← role embedded in JWT
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

/**
 * Get user profile by userId.
 */
export const getProfile = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User not found');
  return user;
};

export default { register, login, getProfile };
