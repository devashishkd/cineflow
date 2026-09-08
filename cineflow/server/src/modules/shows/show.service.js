import { Op } from 'sequelize';
import Show from './show.model.js';
import Seat from './seat.model.js';
import Theatre from '../theatres/theatre.model.js';
import Movie from '../movies/movie.model.js';
import { getShowCache, setShowCache, invalidateShowCache } from '../movies/movie.cache.js';
import { NotFoundError } from '../../utils/errors.js';

export const getShowsForMovie = async (movieId, filters = {}) => {
  const where = { movieId };
  if (filters.theatreId) where.theatreId = filters.theatreId;

  if (filters.city) {
    const theatresInCity = await Theatre.findAll({
      attributes: ['id'],
      where: { city: { [Op.iLike]: filters.city } }
    });
    where.theatreId = { [Op.in]: theatresInCity.map(t => t.id) };
  }

  return Show.findAll({
    where,
    include: [{ model: Theatre, as: 'theatre' }],
    order: [['showDate', 'ASC'], ['showTime', 'ASC']]
  });
};

export const getShowById = async (showId) => {
  const cached = await getShowCache(showId);

  let showMeta;
  if (cached) {
    showMeta = cached;
  } else {
    const show = await Show.findByPk(showId, {
      include: [
        { model: Movie, as: 'movie' },
        { model: Theatre, as: 'theatre' }
      ]
    });

    if (!show) throw new NotFoundError('Show not found');

    showMeta = show.toJSON();
    await setShowCache(showId, showMeta);
  }

  const seats = await Seat.findAll({
    where: { showId },
    order: [['seatNumber', 'ASC']]
  });

  return { ...showMeta, seats };
};

export const createShow = async (data) => {
  const show = await Show.create(data);

  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsToCreate = [];
  rows.forEach((row) => {
    for (let i = 1; i <= 10; i++) {
      seatsToCreate.push({
        showId: show.id,
        seatNumber: `${row}${i}`,
        row,
        status: 'AVAILABLE',
      });
    }
  });

  await Seat.bulkCreate(seatsToCreate);
  return show;
};

export const getSeatsByShow = async (showId) => {
  return Seat.findAll({
    where: { showId },
    order: [['seatNumber', 'ASC']]
  });
};

export const updateSeatStatus = async (seatIds, newStatus, expectedCurrentStatus = null) => {
  const where = { id: { [Op.in]: seatIds } };
  
  if (expectedCurrentStatus) {
    where.status = expectedCurrentStatus; // compare-and-swap
  }

  const [modifiedCount] = await Seat.update(
    { status: newStatus },
    { where }
  );

  if (modifiedCount > 0) {
    const seats = await Seat.findAll({
      attributes: ['showId'],
      where: { id: { [Op.in]: seatIds } },
      group: ['showId']
    });
    for (const seat of seats) {
      await invalidateShowCache(seat.showId);
    }
  }

  console.log(`[Show] Seat status update: ${modifiedCount}/${seatIds.length} seats → ${newStatus}${expectedCurrentStatus ? ` (was ${expectedCurrentStatus})` : ''}`);
  return modifiedCount;
};


export const updateShow = async (id, data) => {
  const [updatedCount, [show]] = await Show.update(data, { where: { id }, returning: true });
  if (updatedCount === 0) throw new NotFoundError('Show not found');
  await invalidateShowCache(id);
  return show;
};

export const deleteShow = async (id) => {
  const deletedCount = await Show.destroy({ where: { id } });
  if (deletedCount === 0) throw new NotFoundError('Show not found');
  await invalidateShowCache(id);
  return { id };
};

export const getAllShows = async (filters = {}) => {
  const where = {};
  if (filters.movieId) where.movieId = filters.movieId;
  if (filters.theatreId) where.theatreId = filters.theatreId;
  return Show.findAll({
    where,
    include: [
      { model: Movie, as: 'movie', attributes: ['id', 'title'] },
      { model: Theatre, as: 'theatre', attributes: ['id', 'name', 'city'] },
    ],
    order: [['showDate', 'DESC'], ['showTime', 'ASC']],
    limit: 200,
  });
};

export default { getShowsForMovie, getShowById, createShow, getSeatsByShow, updateSeatStatus, updateShow, deleteShow, getAllShows };
