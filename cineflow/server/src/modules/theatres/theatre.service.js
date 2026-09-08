import { Op } from 'sequelize';
import Theatre from './theatre.model.js';
import { NotFoundError } from '../../utils/errors.js';

export const getAllTheatres = async (city) => {
  const where = {};
  if (city) where.city = { [Op.iLike]: city };
  return Theatre.findAll({
    where,
    order: [['name', 'ASC']]
  });
};

export const getCities = async () => {
  const theatres = await Theatre.findAll({
    attributes: ['city'],
    where: {
      city: { [Op.ne]: null }
    },
    group: ['city'],
    order: [['city', 'ASC']]
  });
  const dbCities = theatres.map(t => t.city?.trim()).filter(Boolean);
  const defaultCities = ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Chandigarh', 'Jaipur'];
  return Array.from(new Set([...dbCities, ...defaultCities]));
};

export const createTheatre = async (data) => Theatre.create(data);

export const updateTheatre = async (id, data) => {
  const [updatedCount, [theatre]] = await Theatre.update(data, { 
    where: { id }, 
    returning: true 
  });
  if (updatedCount === 0) throw new NotFoundError('Theatre not found');
  return theatre;
};

export const deleteTheatre = async (id) => {
  const deletedCount = await Theatre.destroy({ where: { id } });
  if (deletedCount === 0) throw new NotFoundError('Theatre not found');
  return { id };
};

export default { getAllTheatres, getCities, createTheatre, updateTheatre, deleteTheatre };
