import 'dotenv/config';
import app from './src/app.js';
import sequelize from './src/config/db.js';

// Import model so Sequelize registers it before sync
import './src/models/user.model.js';

const PORT = process.env.PORT || 3001;

const start = async () => {
  let retries = 5;

  // Retry DB connection — Postgres may not be ready immediately in Docker
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log('✅ User DB connected');
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
  console.log('✅ User tables synced');

  app.listen(PORT, () => console.log(`🚀 User Service running on port ${PORT}`));
};

start();
