import movieService from './movie.service.js';

export const getAllMovies = async (req, res) => {
  try {
    const movies = await movieService.getAllMovies(req.query);
    res.json({ success: true, count: movies.length, data: movies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const movie = await movieService.getMovieById(req.params.id);
    res.json({ success: true, data: movie });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const createMovie = async (req, res) => {
  try {
    const movie = await movieService.createMovie(req.body);
    res.status(201).json({ success: true, data: movie });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export default { getAllMovies, getMovieById, createMovie };
