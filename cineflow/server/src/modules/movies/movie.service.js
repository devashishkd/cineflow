import { Op } from 'sequelize';
import Movie from './movie.model.js';
import Show from '../shows/show.model.js';
import Theatre from '../theatres/theatre.model.js';
import { getMoviesCache, setMoviesCache, invalidateMoviesCache } from './movie.cache.js';
import { NotFoundError } from '../../utils/errors.js';

/**
 * Get all movies with search, filter, and pagination.
 */
export const getAllMovies = async (filters = {}) => {
  const cached = await getMoviesCache(filters);
  if (cached) return cached;

  const {
    q, genre, language, city, status, rating,
    page = 1, limit = 20,
    sortBy = 'releaseDate', sortOrder = 'desc',
  } = filters;

  const where = {};

  if (q) where.title = { [Op.iLike]: `%${q}%` };
  if (genre) where.genre = { [Op.iLike]: genre };
  if (language) where.language = { [Op.iLike]: language };
  if (rating) where.rating = { [Op.gte]: parseFloat(rating) };

  const today = new Date().toISOString().split('T')[0];
  if (status === 'now_showing') {
    where.releaseDate = { [Op.lte]: today };
  } else if (status === 'upcoming') {
    where.releaseDate = { [Op.gt]: today };
  }

  // City filter
  if (city && status !== 'upcoming') {
    const theatresInCity = await Theatre.findAll({
      attributes: ['id'],
      where: { city: { [Op.iLike]: city } }
    });
    const theatreIds = theatresInCity.map((t) => t.id);
    
    // Wait for Show migration to support this
    const shows = await Show.findAll({
      attributes: ['movieId'],
      where: { theatreId: { [Op.in]: theatreIds } },
      group: ['movieId']
    });
    where.id = { [Op.in]: shows.map(s => s.movieId) };
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;
  
  const order = [[sortBy, sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']];

  const { rows: movies, count: total } = await Movie.findAndCountAll({
    where,
    order,
    limit: limitNum,
    offset
  });

  const result = {
    data: movies,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    },
  };

  await setMoviesCache(filters, result);
  return result;
};

export const getMovieById = async (id) => {
  const movie = await Movie.findByPk(id);
  if (!movie) throw new NotFoundError('Movie not found');
  return movie;
};

export const createMovie = async (data) => {
  await invalidateMoviesCache();
  return Movie.create(data);
};

export const updateMovie = async (id, data) => {
  const [updatedCount, [movie]] = await Movie.update(data, { 
    where: { id }, 
    returning: true 
  });
  if (updatedCount === 0) throw new NotFoundError('Movie not found');
  await invalidateMoviesCache();
  return movie;
};

export const deleteMovie = async (id) => {
  const deletedCount = await Movie.destroy({ where: { id } });
  if (deletedCount === 0) throw new NotFoundError('Movie not found');
  await invalidateMoviesCache();
  return { id };
};

export default { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
