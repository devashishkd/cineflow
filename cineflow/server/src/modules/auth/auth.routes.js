import express from 'express';
import authController from './auth.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public
router.post('/register', authController.register);
router.post('/login',    authController.login);

// Protected
router.get('/me', authMiddleware, authController.getProfile);

export default router;
