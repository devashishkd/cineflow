import { Op } from 'sequelize';
import { Movie, Theatre, Show, Seat } from '../models/index.js';
import redis from '../config/redis.js';

// ─── Cache TTLs ───────────────────────────────────────────────────────────
const MOVIES_CACHE_TTL = 5 * 60;  // 5 minutes — movie listings change infrequently
const SHOW_CACHE_TTL   = 2 * 60;  // 2 minutes — seat availability changes more often

// ─── Movies ───────────────────────────────────────────────────────────────

const getAllMovies = async (filters = {}) => {
  const cacheKey = `movies:all:${filters.genre || '*'}:${filters.language || '*'}`;

  // Cache-aside: check Redis first
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error('[Cache] Redis error on GET, falling through to DB:', err.message);
  }

  // Cache miss — query DB
  const where = {};
  if (filters.genre) where.genre = filters.genre;
  if (filters.language) where.language = filters.language;

  const movies = await Movie.findAll({ where, order: [['createdAt', 'DESC']] });

  // Populate cache (fire-and-forget — don't block the response)
  try {
    await redis.set(cacheKey, JSON.stringify(movies), 'EX', MOVIES_CACHE_TTL);
    console.log(`[Cache SET] ${cacheKey} (TTL: ${MOVIES_CACHE_TTL}s)`);
  } catch (err) {
    console.error('[Cache] Redis error on SET:', err.message);
  }

  return movies;
};

const getMovieById = async (id) => {
  const movie = await Movie.findByPk(id);
  if (!movie) throw new Error('Movie not found');
  return movie;
};

const createMovie = async (data) => {
  // Invalidate the movies list cache when a new movie is added
  try {
    let cursor = '0';
    let deletedCount = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', 'movies:all:*', 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
        deletedCount += keys.length;
      }
    } while (cursor !== '0');
    console.log(`[Cache INVALIDATE] movies:all:* (${deletedCount} keys) via SCAN`);
  } catch (err) {
    console.error('[Cache] Redis error on INVALIDATE:', err.message);
  }
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
  const cacheKey = `show:${showId}`;

  // Cache-aside: check Redis first
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error('[Cache] Redis error on GET, falling through to DB:', err.message);
  }

  // Cache miss — query DB with full associations
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

  // Populate cache
  try {
    await redis.set(cacheKey, JSON.stringify(show), 'EX', SHOW_CACHE_TTL);
    console.log(`[Cache SET] ${cacheKey} (TTL: ${SHOW_CACHE_TTL}s)`);
  } catch (err) {
    console.error('[Cache] Redis error on SET:', err.message);
  }

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
 *
 * Phase 2 change: invalidate the show cache after updating seat status so the
 * next getShowById call reflects the new BOOKED/AVAILABLE state instead of
 * serving stale data.
 */
const updateSeatStatus = async (seatIds, status) => {
  const [affectedRows] = await Seat.update(
    { status },
    { where: { id: seatIds } }
  );

  // Find which shows are affected and bust their cache entries
  if (affectedRows > 0) {
    try {
      const seats = await Seat.findAll({ where: { id: seatIds }, attributes: ['showId'] });
      const showIds = [...new Set(seats.map((s) => s.showId))];
      for (const showId of showIds) {
        await redis.del(`show:${showId}`);
        console.log(`[Cache INVALIDATE] show:${showId}`);
      }
    } catch (err) {
      console.error('[Cache] Redis error on INVALIDATE after seat update:', err.message);
    }
  }

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
