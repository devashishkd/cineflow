import express from 'express';
import adminController from './admin.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/requireRole.middleware.js';

const router = express.Router();

// All admin routes require a valid JWT + ADMIN role
router.use(authMiddleware, requireRole('ADMIN', 'THEATRE_MANAGER'));

router.get('/dashboard',         adminController.getDashboard);
router.get('/summary',           adminController.getSummary);
router.get('/popular-movies',    adminController.getPopularMovies);
router.get('/popular-theatres',  adminController.getPopularTheatres);
router.get('/daily-revenue',     adminController.getDailyRevenue);
router.get('/status-breakdown',  adminController.getStatusBreakdown);

export default router;
