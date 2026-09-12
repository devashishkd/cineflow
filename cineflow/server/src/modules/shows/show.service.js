import Show from './show.model.js';
import Seat from './seat.model.js';
import Theatre from '../theatres/theatre.model.js';
import Movie from '../movies/movie.model.js';
import { getShowCache, setShowCache, invalidateShowCache } from '../movies/movie.cache.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

export const getShowsForMovie = async (movieId, filters = {}) => {
  const query = { movieId };

  if (filters.city) {
    const cityPattern = filters.city.toLowerCase().includes('delhi')
      ? 'delhi'
      : `^${filters.city.trim()}$`;
    const theatresInCity = await Theatre.find(
      { city: { $regex: cityPattern, $options: 'i' } },
      '_id'
    );
    const theatreIds = theatresInCity.map((t) => t._id);
    query.theatreId = { $in: theatreIds };
  }

  if (filters.theatreId) {
    query.theatreId = filters.theatreId;
  }

  const shows = await Show.find(query)
    .populate('theatreId', 'id name city address totalScreens')
    .sort({ showDate: 1, showTime: 1 });

  return shows.map((s) => {
    const obj = s.toJSON ? s.toJSON() : { ...s };
    obj.theatre = obj.theatreId;
    return obj;
  });
};

const ensureSeatsForShow = async (showId, currentSeats) => {
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const existingSet = new Set(currentSeats.map((s) => s.seatNumber));
  const missingSeats = [];

  for (const row of rows) {
    for (let col = 1; col <= 20; col++) {
      const seatNumber = `${row}${col}`;
      if (!existingSet.has(seatNumber)) {
        missingSeats.push({ showId, seatNumber, row, status: 'AVAILABLE' });
      }
    }
  }

  if (missingSeats.length > 0) {
    try {
      const created = await Seat.insertMany(missingSeats, { ordered: false });
      return [...currentSeats, ...created];
    } catch {
      return Seat.find({ showId }).sort({ seatNumber: 1 });
    }
  }
  return currentSeats;
};

export const getShowById = async (showId) => {
  const cached = await getShowCache(showId);

  let showMeta;
  if (cached) {
    showMeta = cached;
  } else {
    const show = await Show.findById(showId)
      .populate('movieId')
      .populate('theatreId');

    if (!show) throw new NotFoundError('Show not found');

    // Normalize: expose movieId/theatreId as movie/theatre for frontend compatibility
    showMeta = show.toJSON();
    showMeta.movie   = showMeta.movieId;
    showMeta.theatre = showMeta.theatreId;
    await setShowCache(showId, showMeta);
  }

  const rawSeats = await Seat.find({ showId }).sort({ seatNumber: 1 });
  const seats    = await ensureSeatsForShow(showId, rawSeats);

  return { ...showMeta, seats };
};

export const createShow = async (data) => {
  const show = await Show.create(data);

  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsToCreate = [];
  rows.forEach((row) => {
    for (let i = 1; i <= 20; i++) {
      seatsToCreate.push({ showId: show._id, seatNumber: `${row}${i}`, row, status: 'AVAILABLE' });
    }
  });

  await Seat.insertMany(seatsToCreate);
  return show;
};

export const getSeatsByShow = async (showId) => {
  const seats = await Seat.find({ showId }).sort({ seatNumber: 1 });
  return ensureSeatsForShow(showId, seats);
};

export const updateSeatStatus = async (seatIds, newStatus, expectedCurrentStatus = null) => {
  const filter = { _id: { $in: seatIds } };
  if (expectedCurrentStatus) filter.status = expectedCurrentStatus;

  const result = await Seat.updateMany(filter, { $set: { status: newStatus } });
  const modifiedCount = result.modifiedCount;

  if (modifiedCount > 0) {
    // Invalidate show cache for affected shows
    const affectedShows = await Seat.distinct('showId', { _id: { $in: seatIds } });
    for (const sid of affectedShows) {
      await invalidateShowCache(sid.toString());
    }
  }

  console.log(`[Show] Seat status update: ${modifiedCount}/${seatIds.length} seats → ${newStatus}${expectedCurrentStatus ? ` (was ${expectedCurrentStatus})` : ''}`);
  return modifiedCount;
};

export const updateShow = async (id, data) => {
  const show = await Show.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!show) throw new NotFoundError('Show not found');
  await invalidateShowCache(id);
  return show;
};

export const deleteShow = async (id) => {
  const show = await Show.findByIdAndDelete(id);
  if (!show) throw new NotFoundError('Show not found');
  await Seat.deleteMany({ showId: id });
  await invalidateShowCache(id);
  return { id };
};

export const getAllShows = async (filters = {}) => {
  const query = {};
  if (filters.movieId) query.movieId = filters.movieId;
  if (filters.theatreId) query.theatreId = filters.theatreId;

  const shows = await Show.find(query)
    .populate('movieId', 'id title')
    .populate('theatreId', 'id name city')
    .sort({ showDate: -1, showTime: 1 })
    .limit(200);

  return shows.map((s) => {
    const obj = s.toJSON ? s.toJSON() : { ...s };
    obj.movie = obj.movieId;
    obj.theatre = obj.theatreId;
    return obj;
  });
};

export default { getShowsForMovie, getShowById, createShow, getSeatsByShow, updateSeatStatus, updateShow, deleteShow, getAllShows };
