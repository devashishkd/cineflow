import { Op } from 'sequelize';
import { Movie, Theatre, Show, Seat } from '../models/index.js';

// ─── Movies ───────────────────────────────────────────────────────────────

const getAllMovies = async (filters = {}) => {
  const where = {};
  if (filters.genre) where.genre = filters.genre;
  if (filters.language) where.language = filters.language;

  return Movie.findAll({ where, order: [['createdAt', 'DESC']] });
};

const getMovieById = async (id) => {
  const movie = await Movie.findByPk(id);
  if (!movie) throw new Error('Movie not found');
  return movie;
};

const createMovie = async (data) => {
  return Movie.create(data);
};

// ─── Theatres ─────────────────────────────────────────────────────────────

const getAllTheatres = async (city) => {
  const where = {};
  if (city) where.city = city;
  return Theatre.findAll({ where });
};

const createTheatre = async (data) => {
  return Theatre.create(data);
};

// ─── Shows ────────────────────────────────────────────────────────────────

const getShowsForMovie = async (movieId) => {
  return Show.findAll({
    where: { movieId },
    include: [{ model: Theatre, as: 'theatre' }],
    order: [
      ['showDate', 'ASC'],
      ['showTime', 'ASC'],
    ],
  });
};

const getShowById = async (showId) => {
  const show = await Show.findByPk(showId, {
    include: [
      { model: Movie, as: 'movie' },
      { model: Theatre, as: 'theatre' },
      {
        model: Seat,
        as: 'seats',
        order: [['seatNumber', 'ASC']],
      },
    ],
  });
  if (!show) throw new Error('Show not found');
  return show;
};

const createShow = async (data) => {
  const show = await Show.create(data);

  // Auto-generate seats for the show: 5 rows × 10 seats = 50 seats
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsToCreate = [];
  rows.forEach((row) => {
    for (let i = 1; i <= 10; i++) {
      seatsToCreate.push({
        showId: show.id,
        seatNumber: `${row}${i}`,
        row,
        status: 'AVAILABLE',
      });
    }
  });

  await Seat.bulkCreate(seatsToCreate);
  return show;
};

// ─── Seats ────────────────────────────────────────────────────────────────

const getSeatsByShow = async (showId) => {
  return Seat.findAll({
    where: { showId },
    order: [['seatNumber', 'ASC']],
  });
};

/**
 * Update seat status — called by booking-service after a booking is confirmed.
 * In Phase 1: AVAILABLE → BOOKED
 * In Phase 2: will use Redis LOCKED status instead
 */
const updateSeatStatus = async (seatIds, status) => {
  const [affectedRows] = await Seat.update(
    { status },
    { where: { id: seatIds } }
  );
  return affectedRows;
};

export default {
  getAllMovies,
  getMovieById,
  createMovie,
  getAllTheatres,
  createTheatre,
  getShowsForMovie,
  getShowById,
  createShow,
  getSeatsByShow,
  updateSeatStatus,
};
