import 'dotenv/config';
import app from './src/app.js';
import sequelize from './src/config/db.js';

import './src/models/booking.model.js';

const PORT = process.env.PORT || 3003;

const start = async () => {
  let retries = 5;

  while (retries) {
    try {
      await sequelize.authenticate();
      console.log('✅ Booking DB connected');
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
  console.log('✅ Booking tables synced');

  app.listen(PORT, () => console.log(`🚀 Booking Service running on port ${PORT}`));
};

start();
