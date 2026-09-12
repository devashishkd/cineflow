import 'dotenv/config';
import { validateEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 3000;

const start = async () => {
  // 1. Validate required environment variables
  validateEnv();

  // 2. Connect to MongoDB (fail open for local/offline development)
  const dbStatus = await connectDB();
  if (!dbStatus.connected) {
    console.warn('[Startup] MongoDB unavailable. Starting server in degraded mode.');
  }

  // 3. Start HTTP server
  app.listen(PORT, () => {
    console.log(
      dbStatus.connected
        ? `🚀 CineFlow monolith running on port ${PORT} with MongoDB`
        : `🚀 CineFlow monolith running on port ${PORT} in degraded mode (MongoDB unavailable)`
    );
    console.log(`   Health: http://localhost:${PORT}/health`);
  });
};

start();
