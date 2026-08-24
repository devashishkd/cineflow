import { Op } from 'sequelize';
import Movie from './movie.model.js';
import Show from '../shows/show.model.js';
import Theatre from '../theatres/theatre.model.js';
import {
  getMoviesCache,
  setMoviesCache,
  invalidateMoviesCache,
} from './movie.cache.js';

/**
 * Get all movies with optional filters (genre, language, city, status).
 * Results are cached in Redis (cache-aside pattern).
 */
export const getAllMovies = async (filters = {}) => {
  const cacheKey = `movies:all:${filters.genre || '*'}:${filters.language || '*'}:${filters.city || '*'}:${filters.status || '*'}`;

  const cached = await getMoviesCache(cacheKey);
  if (cached) return cached;

  const where = {};
  if (filters.genre)    where.genre    = filters.genre;
  if (filters.language) where.language = filters.language;

  const today = new Date().toISOString().split('T')[0];
  if (filters.status === 'now_showing') {
    where.releaseDate = { [Op.lte]: today };
  } else if (filters.status === 'upcoming') {
    where.releaseDate = { [Op.gt]: today };
  }

  const include = [];
  if (filters.city && filters.status !== 'upcoming') {
    include.push({
      model: Show,
      as: 'shows',
      required: true,
      attributes: [],
      include: [{
        model: Theatre,
        as: 'theatre',
        where: { city: filters.city },
        required: true,
        attributes: [],
      }],
    });
  }

  const queryOptions = { where, include, order: [['releaseDate', 'DESC']] };
  if (include.length > 0) queryOptions.group = ['Movie.id'];

  const movies = await Movie.findAll(queryOptions);

  await setMoviesCache(cacheKey, movies);
  return movies;
};

/**
 * Get a single movie by ID.
 */
export const getMovieById = async (id) => {
  const movie = await Movie.findByPk(id);
  if (!movie) throw new Error('Movie not found');
  return movie;
};

/**
 * Create a new movie (invalidates the list cache).
 */
export const createMovie = async (data) => {
  await invalidateMoviesCache();
  return Movie.create(data);
};

export default { getAllMovies, getMovieById, createMovie };
