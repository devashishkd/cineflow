import { Sequelize } from 'sequelize';

const isNeon = process.env.DB_URL && process.env.DB_URL.includes('neon.tech');

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries during debugging
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
