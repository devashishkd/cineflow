import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries during debugging
});

export default sequelize;
