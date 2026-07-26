import movieService from '../services/movie.service.js';

const getAllMovies = async (req, res) => {
  try {
    const { genre, language } = req.query;
    const movies = await movieService.getAllMovies({ genre, language });
    res.json({ success: true, count: movies.length, data: movies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMovieById = async (req, res) => {
  try {
    const movie = await movieService.getMovieById(req.params.id);
    res.json({ success: true, data: movie });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const createMovie = async (req, res) => {
  try {
    const movie = await movieService.createMovie(req.body);
    res.status(201).json({ success: true, data: movie });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getShowsForMovie = async (req, res) => {
  try {
    const shows = await movieService.getShowsForMovie(req.params.movieId);
    res.json({ success: true, count: shows.length, data: shows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllTheatres = async (req, res) => {
  try {
    const { city } = req.query;
    const theatres = await movieService.getAllTheatres(city);
    res.json({ success: true, count: theatres.length, data: theatres });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createTheatre = async (req, res) => {
  try {
    const theatre = await movieService.createTheatre(req.body);
    res.status(201).json({ success: true, data: theatre });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export default {
  getAllMovies,
  getMovieById,
  createMovie,
  getShowsForMovie,
  getAllTheatres,
  createTheatre,
};
