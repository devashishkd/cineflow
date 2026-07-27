import express from 'express';
const router = express.Router();
import userController from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected route — requires valid JWT
router.get('/me', authMiddleware, userController.getProfile);

// Internal route (No JWT auth, used for service-to-service communication)
router.get('/internal/:userId', userController.getInternalUser);

export default router;
