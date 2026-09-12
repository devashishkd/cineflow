import Theatre from './theatre.model.js';
import Show from '../shows/show.model.js';
import Seat from '../shows/seat.model.js';
import { invalidateShowCache } from '../movies/movie.cache.js';
import { NotFoundError } from '../../utils/errors.js';

export const getAllTheatres = async (city) => {
  const query = {};
  if (city) query.city = { $regex: `^${city}$`, $options: 'i' };
  return Theatre.find(query).sort({ name: 1 });
};

export const getCities = async () => {
  const dbCities = await Theatre.distinct('city', { city: { $ne: null } });
  const sorted = dbCities.map((c) => c?.trim()).filter(Boolean).sort();
  const defaultCities = ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Chandigarh', 'Jaipur'];
  return Array.from(new Set([...sorted, ...defaultCities]));
};

export const createTheatre = async (data) => Theatre.create(data);

export const updateTheatre = async (id, data) => {
  const theatre = await Theatre.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!theatre) throw new NotFoundError('Theatre not found');
  return theatre;
};

export const deleteTheatre = async (id) => {
  const theatre = await Theatre.findByIdAndDelete(id);
  if (!theatre) throw new NotFoundError('Theatre not found');

  // Cascade delete all shows and seats in this theatre
  const shows = await Show.find({ theatreId: id }, '_id');
  const showIds = shows.map((s) => s._id);
  if (showIds.length > 0) {
    await Seat.deleteMany({ showId: { $in: showIds } });
    await Show.deleteMany({ theatreId: id });
    for (const sid of showIds) {
      await invalidateShowCache(sid.toString());
    }
  }

  return { id, deletedShowsCount: showIds.length };
};

export default { getAllTheatres, getCities, createTheatre, updateTheatre, deleteTheatre };
