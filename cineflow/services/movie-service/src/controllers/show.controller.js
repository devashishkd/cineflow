import movieService from '../services/movie.service.js';

const getShowById = async (req, res) => {
  try {
    const show = await movieService.getShowById(req.params.id);
    res.json({ success: true, data: show });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const createShow = async (req, res) => {
  try {
    const { movieId, theatreId, showDate, showTime, price } = req.body;
    if (!movieId || !theatreId || !showDate || !showTime || !price) {
      return res.status(400).json({
        success: false,
        message: 'movieId, theatreId, showDate, showTime, and price are required',
      });
    }
    const show = await movieService.createShow(req.body);
    res.status(201).json({ success: true, data: show });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getSeatsByShow = async (req, res) => {
  try {
    const seats = await movieService.getSeatsByShow(req.params.id);
    res.json({ success: true, count: seats.length, data: seats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Internal endpoint — called by booking-service to update seat status.
 * In Phase 2 this will be replaced by Kafka event consumption.
 */
const updateSeatStatus = async (req, res) => {
  try {
    const { seatIds, status } = req.body;
    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0 || !status) {
      return res.status(400).json({ success: false, message: 'seatIds (array) and status are required' });
    }
    const updated = await movieService.updateSeatStatus(seatIds, status);
    res.json({ success: true, data: { updated } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default { getShowById, createShow, getSeatsByShow, updateSeatStatus };
