import Movie from './movie.model.js';
import Show from '../shows/show.model.js';
import Seat from '../shows/seat.model.js';
import Theatre from '../theatres/theatre.model.js';
import { getMoviesCache, setMoviesCache, invalidateMoviesCache, invalidateShowCache } from './movie.cache.js';
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

  const query = {};

  if (q) query.title = { $regex: q, $options: 'i' };
  if (genre) query.genre = { $regex: `^${genre}$`, $options: 'i' };
  if (language) query.language = { $regex: `^${language}$`, $options: 'i' };
  if (rating) query.rating = { $gte: parseFloat(rating) };

  const today = new Date().toISOString().split('T')[0];
  if (status === 'now_showing') {
    query.releaseDate = { $lte: today };
  } else if (status === 'upcoming') {
    query.releaseDate = { $gt: today };
  }

  // City filter: find theatres in city → shows → movie ids
  if (city && status !== 'upcoming') {
    const theatresInCity = await Theatre.find(
      { city: { $regex: `^${city}$`, $options: 'i' } },
      '_id'
    );
    const theatreIds = theatresInCity.map((t) => t._id);

    const shows = await Show.distinct('movieId', { theatreId: { $in: theatreIds } });
    query._id = { $in: shows };
  }

  const pageNum  = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip     = (pageNum - 1) * limitNum;

  const sortDir = sortOrder.toUpperCase() === 'ASC' ? 1 : -1;
  const sort    = { [sortBy]: sortDir };

  const [movies, total] = await Promise.all([
    Movie.find(query).sort(sort).skip(skip).limit(limitNum),
    Movie.countDocuments(query),
  ]);

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
  const movie = await Movie.findById(id);
  if (!movie) throw new NotFoundError('Movie not found');
  return movie;
};

export const createMovie = async (data) => {
  await invalidateMoviesCache();
  return Movie.create(data);
};

export const updateMovie = async (id, data) => {
  const movie = await Movie.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!movie) throw new NotFoundError('Movie not found');
  await invalidateMoviesCache();
  return movie;
};

export const deleteMovie = async (id) => {
  const movie = await Movie.findByIdAndDelete(id);
  if (!movie) throw new NotFoundError('Movie not found');

  // Cascade delete all shows and their seats for this movie
  const shows = await Show.find({ movieId: id }, '_id');
  const showIds = shows.map((s) => s._id);

  if (showIds.length > 0) {
    // Delete all seats for these shows
    await Seat.deleteMany({ showId: { $in: showIds } });

    // Delete all shows for this movie
    await Show.deleteMany({ movieId: id });

    // Invalidate Redis cache for each deleted show
    for (const sid of showIds) {
      await invalidateShowCache(sid.toString());
    }
  }

  await invalidateMoviesCache();
  return { id, deletedShowsCount: showIds.length };
};

export default { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
