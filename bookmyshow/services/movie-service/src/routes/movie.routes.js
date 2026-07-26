import express from 'express';
const router = express.Router();
import movieController from '../controllers/movie.controller.js';

// GET  /api/movies             — list all movies (with optional ?genre= ?language= filters)
// POST /api/movies             — create a movie
// GET  /api/movies/:id         — get one movie
// GET  /api/movies/:movieId/shows — get all shows for a movie
// GET  /api/movies/theatres    — list all theatres (with optional ?city= filter)
// POST /api/movies/theatres    — create a theatre

router.get('/theatres', movieController.getAllTheatres);
router.post('/theatres', movieController.createTheatre);

router.get('/', movieController.getAllMovies);
router.post('/', movieController.createMovie);
router.get('/:id', movieController.getMovieById);
router.get('/:movieId/shows', movieController.getShowsForMovie);

export default router;
