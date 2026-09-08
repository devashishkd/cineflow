/**
 * requireRole.middleware.js
 *
 * RBAC guard middleware factory.
 *
 * Usage:
 *   router.post('/', authMiddleware, requireRole('ADMIN'), controller.create);
 *   router.post('/', authMiddleware, requireRole('ADMIN', 'THEATRE_MANAGER'), controller.create);
 *
 * Must be used AFTER authMiddleware (which sets req.user).
 *
 * Interview talking points:
 * - Why factory pattern? So the same function handles any role set.
 * - Why check req.user.role from JWT? Because the role was embedded at login time.
 *   If a role changes in the DB, the user must re-login for it to take effect.
 *   Alternative: fetch the user from DB on every request (slower, but always fresh).
 *   We chose JWT-embedded role for performance with a short-lived token trade-off.
 */

import { ForbiddenError } from '../utils/errors.js';

const requireRole = (...roles) => (req, res, next) => {
  // req.user is set by authMiddleware
  if (!req.user) {
    return next(new ForbiddenError('Authentication required'));
  }

  if (!roles.includes(req.user.role)) {
    return next(
      new ForbiddenError(
        `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role || 'USER'}`
      )
    );
  }

  next();
};

export default requireRole;
