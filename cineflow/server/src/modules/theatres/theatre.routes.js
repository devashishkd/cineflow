import express from 'express';
import theatreController from './theatre.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/requireRole.middleware.js';

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
// Static before dynamic
router.get('/cities', theatreController.getCities);
router.get('/',       theatreController.getAllTheatres);

// ── Admin/Theatre-manager routes ──────────────────────────────────────────────
router.post('/',      authMiddleware, requireRole('ADMIN', 'THEATRE_MANAGER'), theatreController.createTheatre);
router.put('/:id',    authMiddleware, requireRole('ADMIN', 'THEATRE_MANAGER'), theatreController.updateTheatre);
router.delete('/:id', authMiddleware, requireRole('ADMIN', 'THEATRE_MANAGER'), theatreController.deleteTheatre);

export default router;
