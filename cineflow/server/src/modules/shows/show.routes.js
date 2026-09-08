import express from 'express';
import showController from './show.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/requireRole.middleware.js';

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/movie/:movieId', showController.getShowsForMovie);
router.get('/:id/seats',      showController.getSeatsByShow);
router.get('/:id',            showController.getShowById);

// ── Admin/Theatre-manager routes ──────────────────────────────────────────────
router.get(
  '/',
  authMiddleware,
  requireRole('ADMIN', 'THEATRE_MANAGER'),
  showController.getAllShows
);
router.put(
  '/seats/update-status',
  authMiddleware,
  requireRole('ADMIN', 'THEATRE_MANAGER'),
  showController.updateSeatStatus
);
router.post(
  '/',
  authMiddleware,
  requireRole('ADMIN', 'THEATRE_MANAGER'),
  showController.createShow
);
router.put(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'THEATRE_MANAGER'),
  showController.updateShow
);
router.delete(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'THEATRE_MANAGER'),
  showController.deleteShow
);

export default router;
