import express from 'express';
import showController from './show.controller.js';

const router = express.Router();

// POST /api/shows                         — create show (auto-generates 50 seats)
// GET  /api/shows/:id                     — show details + all seats
// GET  /api/shows/:id/seats               — seats for a show
// PUT  /api/shows/seats/update-status     — update seat status (internal)
// GET  /api/shows/movie/:movieId          — shows for a movie

// Static routes before dynamic
router.put('/seats/update-status', showController.updateSeatStatus);
router.get('/movie/:movieId',      showController.getShowsForMovie);

router.post('/',          showController.createShow);
router.get('/:id',        showController.getShowById);
router.get('/:id/seats',  showController.getSeatsByShow);

export default router;
