import theatreService from './theatre.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getAllTheatres = asyncHandler(async (req, res) => {
  const theatres = await theatreService.getAllTheatres(req.query.city);
  res.json({ success: true, count: theatres.length, data: theatres });
});

export const getCities = asyncHandler(async (req, res) => {
  const cities = await theatreService.getCities();
  res.json({ success: true, data: cities });
});

export const createTheatre = asyncHandler(async (req, res) => {
  const theatre = await theatreService.createTheatre(req.body);
  res.status(201).json({ success: true, data: theatre });
});

export const updateTheatre = asyncHandler(async (req, res) => {
  const theatre = await theatreService.updateTheatre(req.params.id, req.body);
  res.json({ success: true, data: theatre });
});

export const deleteTheatre = asyncHandler(async (req, res) => {
  await theatreService.deleteTheatre(req.params.id);
  res.json({ success: true, message: 'Theatre deleted successfully' });
});

export default { getAllTheatres, getCities, createTheatre, updateTheatre, deleteTheatre };
