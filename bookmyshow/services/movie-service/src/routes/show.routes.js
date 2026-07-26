import express from 'express';
const router = express.Router();
import showController from '../controllers/show.controller.js';

// POST /api/shows                      — create a show (auto-generates 50 seats)
// GET  /api/shows/:id                  — get show details + all seats
// GET  /api/shows/:id/seats            — get seats for a show
// PUT  /api/shows/seats/update-status  — internal: update seat status (called by booking-service)

// IMPORTANT: static routes before dynamic (:id) to avoid conflict
router.put('/seats/update-status', showController.updateSeatStatus);

router.post('/', showController.createShow);
router.get('/:id', showController.getShowById);
router.get('/:id/seats', showController.getSeatsByShow);

export default router;
