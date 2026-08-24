import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './user.model.js';

/**
 * Register a new user.
 */
export const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error('An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
};

/**
 * Login and return a signed JWT.
 */
export const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Invalid email or password');

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new Error('Invalid email or password');

  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email } };
};

/**
 * Get user profile by userId.
 * Called directly by notification.service.js instead of HTTP.
 */
export const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'name', 'email', 'createdAt'],
  });
  if (!user) throw new Error('User not found');
  return user;
};

export default { register, login, getProfile };
