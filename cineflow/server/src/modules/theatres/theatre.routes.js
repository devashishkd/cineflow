import express from 'express';
import theatreController from './theatre.controller.js';

const router = express.Router();

// GET  /api/theatres         — list (optional ?city=)
// GET  /api/theatres/cities  — unique cities
// POST /api/theatres         — create

// Static before dynamic
router.get('/cities', theatreController.getCities);

router.get('/',    theatreController.getAllTheatres);
router.post('/',   theatreController.createTheatre);

export default router;
