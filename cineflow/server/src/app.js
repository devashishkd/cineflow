import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import requestIdMiddleware from './middleware/requestId.middleware.js';
import rateLimitMiddleware  from './middleware/rate-limit.middleware.js';
import errorMiddleware      from './middleware/error.middleware.js';
import logger              from './utils/logger.js';

import authRoutes    from './modules/auth/auth.routes.js';
import movieRoutes   from './modules/movies/movie.routes.js';
import theatreRoutes from './modules/theatres/theatre.routes.js';
import showRoutes    from './modules/shows/show.routes.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import adminRoutes   from './modules/admin/admin.routes.js';

const app = express();

// ─── Request ID (stamp every request before anything else) ────────────────────
app.use(requestIdMiddleware);

// ─── HTTP request logging (morgan → winston) ──────────────────────────────────
// Morgan tokens → structured log entry per request
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: {
      write: (msg) => logger.info(msg.trim(), { source: 'http' }),
    },
  })
);

// ─── Core middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(rateLimitMiddleware);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CineFlow Modular Monolith',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    modules: [
      'auth', 'movies', 'theatres', 'shows',
      'bookings', 'payments', 'notifications',
      'analytics', 'admin',
    ],
  });
});

// ─── API Routes (support both /api prefix and root for frontend compatibility) ───
const mountRoutes = (prefix) => {
  app.use(`${prefix}/auth`,     authRoutes);
  app.use(`${prefix}/movies`,   movieRoutes);
  app.use(`${prefix}/theatres`, theatreRoutes);
  app.use(`${prefix}/shows`,    showRoutes);
  app.use(`${prefix}/bookings`, bookingRoutes);
  app.use(`${prefix}/payments`, paymentRoutes);
  app.use(`${prefix}/admin`,    adminRoutes);
};

mountRoutes('/api');
mountRoutes('');

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    requestId: req.requestId,
  });
});

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorMiddleware);

export default app;
