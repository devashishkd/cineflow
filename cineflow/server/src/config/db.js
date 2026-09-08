import { Sequelize } from 'sequelize';
import env from './env.js';
import logger from '../utils/logger.js';

const isNeon =
  env.DATABASE_URL?.includes('neon.tech') ||
  env.DATABASE_URL?.includes('sslmode=require');

const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg, { source: 'sequelize' }),
  ...(isNeon && {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }),
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ PostgreSQL connected successfully.', { source: 'database' });

    // In development, automatically sync models (NOT for production)
    if (env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('✅ Database synchronized.', { source: 'database' });
    }

    return { connected: true };
  } catch (error) {
    logger.error(`❌ PostgreSQL connection failed: ${error.message}`, { source: 'database' });
    return { connected: false, error };
  }
};

export default sequelize;
