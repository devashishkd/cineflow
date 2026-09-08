import express from 'express';
import movieController from './movie.controller.js';
import showController from '../shows/show.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import requireRole from '../../middleware/requireRole.middleware.js';

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/',               movieController.getAllMovies);   // search + filter + paginate
router.get('/:movieId/shows', showController.getShowsForMovie);
router.get('/:id',            movieController.getMovieById);

// ── Admin-only routes ─────────────────────────────────────────────────────────
// authMiddleware verifies JWT; requireRole checks the embedded role claim.
router.post('/',      authMiddleware, requireRole('ADMIN', 'THEATRE_MANAGER'), movieController.createMovie);
router.put('/:id',    authMiddleware, requireRole('ADMIN', 'THEATRE_MANAGER'), movieController.updateMovie);
router.delete('/:id', authMiddleware, requireRole('ADMIN', 'THEATRE_MANAGER'), movieController.deleteMovie);

export default router;
