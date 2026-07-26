import 'dotenv/config';
import app from './src/app.js';
import { sequelize } from './src/models/index.js';

const PORT = process.env.PORT || 3002;

const start = async () => {
  let retries = 5;

  while (retries) {
    try {
      await sequelize.authenticate();
      console.log('✅ Movie DB connected');
      break;
    } catch (err) {
      retries--;
      console.log(`⏳ DB not ready, retrying in 3s... (${retries} attempts left)`);
      await new Promise((r) => setTimeout(r, 3000));
      if (retries === 0) {
        console.error('❌ Could not connect to DB:', err.message);
        process.exit(1);
      }
    }
  }

  await sequelize.sync({ alter: true });
  console.log('✅ Movie tables synced');

  app.listen(PORT, () => console.log(`🚀 Movie Service running on port ${PORT}`));
};

start();
