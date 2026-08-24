import { Sequelize } from 'sequelize';

const isNeon = process.env.DB_URL && process.env.DB_URL.includes('neon.tech');

/**
 * Single shared Sequelize instance for the entire monolith.
 * All models (User, Movie, Theatre, Show, Seat, Booking, Payment) use this instance.
 */
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  logging: false,
  ...(isNeon && {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }),
});

export default sequelize;
