import express from 'express';
import movieController from './movie.controller.js';

const router = express.Router();

// GET  /api/movies              — list (optional ?genre= ?language= ?city= ?status=)
// POST /api/movies              — create
// GET  /api/movies/:id          — get one
// GET  /api/movies/:movieId/shows — shows for a movie (delegated to show.routes)

router.get('/',    movieController.getAllMovies);
router.post('/',   movieController.createMovie);
router.get('/:id', movieController.getMovieById);

export default router;
