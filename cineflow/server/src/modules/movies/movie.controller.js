import movieService from './movie.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * GET /api/movies
 * Supports: ?q= ?genre= ?language= ?city= ?status= ?rating= ?page= ?limit= ?sortBy= ?sortOrder=
 */
export const getAllMovies = asyncHandler(async (req, res) => {
  const result = await movieService.getAllMovies(req.query);
  res.json({
    success: true,
    count: result.data.length,
    pagination: result.pagination,
    data: result.data,
  });
});

export const getMovieById = asyncHandler(async (req, res) => {
  const movie = await movieService.getMovieById(req.params.id);
  res.json({ success: true, data: movie });
});

export const createMovie = asyncHandler(async (req, res) => {
  const movie = await movieService.createMovie(req.body);
  res.status(201).json({ success: true, data: movie });
});

export const updateMovie = asyncHandler(async (req, res) => {
  const movie = await movieService.updateMovie(req.params.id, req.body);
  res.json({ success: true, data: movie });
});

export const deleteMovie = asyncHandler(async (req, res) => {
  await movieService.deleteMovie(req.params.id);
  res.json({ success: true, message: 'Movie deleted successfully' });
});

export default { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
