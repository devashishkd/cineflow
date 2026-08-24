import Theatre from './theatre.model.js';

/**
 * Get all theatres, optionally filtered by city.
 */
export const getAllTheatres = async (city) => {
  const where = {};
  if (city) where.city = city;
  return Theatre.findAll({ where });
};

/**
 * Get all unique cities that have at least one theatre.
 */
export const getCities = async () => {
  const theatres = await Theatre.findAll({
    attributes: ['city'],
    group: ['city'],
    order: [['city', 'ASC']],
  });
  return theatres.map((t) => t.city);
};

/**
 * Create a new theatre.
 */
export const createTheatre = async (data) => {
  return Theatre.create(data);
};

export default { getAllTheatres, getCities, createTheatre };
