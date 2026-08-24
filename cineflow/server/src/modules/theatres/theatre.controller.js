import theatreService from './theatre.service.js';

export const getAllTheatres = async (req, res) => {
  try {
    const theatres = await theatreService.getAllTheatres(req.query.city);
    res.json({ success: true, count: theatres.length, data: theatres });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCities = async (req, res) => {
  try {
    const cities = await theatreService.getCities();
    res.json({ success: true, data: cities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createTheatre = async (req, res) => {
  try {
    const theatre = await theatreService.createTheatre(req.body);
    res.status(201).json({ success: true, data: theatre });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export default { getAllTheatres, getCities, createTheatre };
