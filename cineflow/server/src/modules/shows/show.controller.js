import showService from './show.service.js';

export const getShowsForMovie = async (req, res) => {
  try {
    const { city, theatreId } = req.query;
    const shows = await showService.getShowsForMovie(req.params.movieId, { city, theatreId });
    res.json({ success: true, count: shows.length, data: shows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getShowById = async (req, res) => {
  try {
    const show = await showService.getShowById(req.params.id);
    res.json({ success: true, data: show });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const createShow = async (req, res) => {
  try {
    const { movieId, theatreId, showDate, showTime, price } = req.body;
    if (!movieId || !theatreId || !showDate || !showTime || !price) {
      return res.status(400).json({
        success: false,
        message: 'movieId, theatreId, showDate, showTime, and price are required',
      });
    }
    const show = await showService.createShow(req.body);
    res.status(201).json({ success: true, data: show });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getSeatsByShow = async (req, res) => {
  try {
    const seats = await showService.getSeatsByShow(req.params.id);
    res.json({ success: true, count: seats.length, data: seats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSeatStatus = async (req, res) => {
  try {
    const { seatIds, status } = req.body;
    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0 || !status) {
      return res.status(400).json({ success: false, message: 'seatIds (array) and status are required' });
    }
    const updated = await showService.updateSeatStatus(seatIds, status);
    res.json({ success: true, data: { updated } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default { getShowsForMovie, getShowById, createShow, getSeatsByShow, updateSeatStatus };
