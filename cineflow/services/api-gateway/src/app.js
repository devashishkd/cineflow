import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import rateLimitMiddleware from './middleware/rateLimit.middleware.js';

const app = express();

app.use(cors());

// ─── Phase 2: Redis-based rate limiting (100 req/min per IP) ──────────────
app.use(rateLimitMiddleware);

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || 'http://localhost:3002';
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3003';

// ─── Health check ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'API Gateway is running',
    timestamp: new Date().toISOString(),
    services: {
      users: USER_SERVICE_URL,
      movies: MOVIE_SERVICE_URL,
      bookings: BOOKING_SERVICE_URL,
    },
  });
});

// ─── Public Routes ────────────────────────────────────────────────────────
// Auth routes → User Service
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
  })
);

// Movie & Show routes → Movie Service (public, no auth required)
app.use(
  '/api/movies',
  createProxyMiddleware({
    target: MOVIE_SERVICE_URL,
    changeOrigin: true,
  })
);

app.use(
  '/api/shows',
  createProxyMiddleware({
    target: MOVIE_SERVICE_URL,
    changeOrigin: true,
  })
);

// ─── Protected Routes ─────────────────────────────────────────────────────
// Booking routes → Booking Service
// NOTE: JWT validation is handled by booking-service itself (each service owns its security)
// In Phase 2, we will add rate-limiting middleware here at the gateway level
app.use(
  '/api/bookings',
  createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true,
  })
);

// Payment routes → Payment Service
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004';
app.use(
  '/api/payments',
  createProxyMiddleware({
    target: PAYMENT_SERVICE_URL,
    changeOrigin: true,
  })
);

export default app;
