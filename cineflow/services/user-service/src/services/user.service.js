import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

/**
 * Register a new user
 */
const register = async ({ name, email, password }) => {
  // Check if email already exists
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new Error('An account with this email already exists');
  }

  // Hash password with bcrypt (salt rounds = 10)
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, passwordHash });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
};

/**
 * Login and return a JWT token
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Sign a JWT valid for 7 days
  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
};

/**
 * Get user profile by userId (from JWT)
 */
const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'name', 'email', 'createdAt'],
  });
  if (!user) throw new Error('User not found');
  return user;
};

export default { register, login, getProfile };
