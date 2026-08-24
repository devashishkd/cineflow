import Show from './show.model.js';
import Seat from './seat.model.js';
import Movie from '../movies/movie.model.js';
import Theatre from '../theatres/theatre.model.js';
import { getShowCache, setShowCache, invalidateShowCache } from '../movies/movie.cache.js';

/**
 * Get all shows for a movie (with optional theatre/city filter).
 */
export const getShowsForMovie = async (movieId, filters = {}) => {
  const where = { movieId };
  if (filters.theatreId) where.theatreId = filters.theatreId;

  const theatreWhere = {};
  if (filters.city) theatreWhere.city = filters.city;

  return Show.findAll({
    where,
    include: [{
      model: Theatre,
      as: 'theatre',
      where: Object.keys(theatreWhere).length ? theatreWhere : undefined,
      required: Object.keys(theatreWhere).length > 0,
    }],
    order: [['showDate', 'ASC'], ['showTime', 'ASC']],
  });
};

/**
 * Get a single show with full associations (movie, theatre, seats).
 * Result is cached in Redis.
 */
export const getShowById = async (showId) => {
  const cached = await getShowCache(showId);
  if (cached) return cached;

  const show = await Show.findByPk(showId, {
    include: [
      { model: Movie,   as: 'movie' },
      { model: Theatre, as: 'theatre' },
      { model: Seat,    as: 'seats', order: [['seatNumber', 'ASC']] },
    ],
  });
  if (!show) throw new Error('Show not found');

  await setShowCache(showId, show);
  return show;
};

/**
 * Create a show and auto-generate 50 seats (5 rows × 10).
 */
export const createShow = async (data) => {
  const show = await Show.create(data);

  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsToCreate = [];
  rows.forEach((row) => {
    for (let i = 1; i <= 10; i++) {
      seatsToCreate.push({ showId: show.id, seatNumber: `${row}${i}`, row, status: 'AVAILABLE' });
    }
  });

  await Seat.bulkCreate(seatsToCreate);
  return show;
};

/**
 * Get all seats for a show.
 */
export const getSeatsByShow = async (showId) => {
  return Seat.findAll({ where: { showId }, order: [['seatNumber', 'ASC']] });
};

/**
 * Update seat status (called internally by payment.controller after payment confirmed).
 * Busts the show cache so the next request reflects updated seat availability.
 */
export const updateSeatStatus = async (seatIds, status) => {
  const [affectedRows] = await Seat.update({ status }, { where: { id: seatIds } });

  if (affectedRows > 0) {
    const seats = await Seat.findAll({ where: { id: seatIds }, attributes: ['showId'] });
    const showIds = [...new Set(seats.map((s) => s.showId))];
    for (const showId of showIds) {
      await invalidateShowCache(showId);
    }
  }

  return affectedRows;
};

export default { getShowsForMovie, getShowById, createShow, getSeatsByShow, updateSeatStatus };
