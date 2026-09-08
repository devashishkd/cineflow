import 'dotenv/config';
import { validateEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';

// ─── Import all models to register schemas ────────────────────────────────────
import './modules/auth/user.model.js';
import './modules/movies/movie.model.js';
import './modules/theatres/theatre.model.js';
import './modules/shows/show.model.js';
import './modules/shows/seat.model.js';
import './modules/bookings/booking.model.js';
import './modules/payments/payment.model.js';
import './modules/notifications/notification.queue.js';

const PORT = process.env.PORT || 3000;

const start = async () => {
  // 1. Validate required environment variables
  validateEnv();

  // 2. Connect to PostgreSQL (fail open for local/offline development)
  const dbStatus = await connectDB();
  if (!dbStatus.connected) {
    console.warn('[Startup] PostgreSQL unavailable. Starting server in degraded mode.');
  }

  // 3. Start HTTP server
  app.listen(PORT, () => {
    console.log(
      dbStatus.connected
        ? `🚀 CineFlow monolith running on port ${PORT} with PostgreSQL`
        : `🚀 CineFlow monolith running on port ${PORT} in degraded mode (PostgreSQL unavailable)`
    );
    console.log(`   Health: http://localhost:${PORT}/health`);
  });
};

start();
