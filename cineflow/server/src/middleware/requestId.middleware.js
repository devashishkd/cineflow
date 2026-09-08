import { randomUUID } from 'crypto';

/**
 * Request ID Middleware
 *
 * Stamps every incoming request with a unique UUID.
 * Sets it on req.requestId and echoes it in the X-Request-Id response header.
 *
 * Interview: Why is a request ID useful?
 * In a high-traffic system with thousands of concurrent requests, log lines
 * from different requests are interleaved. Without a request ID, tracing a
 * single request's lifecycle across multiple services (or even multiple
 * functions in the same service) is nearly impossible.
 *
 * With req.requestId, you can grep logs for one ID and see the full story:
 *   grep "a1b2c3d4" app.log
 *   → [a1b2c3d] POST /api/bookings
 *   → [a1b2c3d] [SeatLock] Locked 2 seats
 *   → [a1b2c3d] [Booking] PENDING → CONFIRMED
 *
 * In microservices, you'd propagate this as a header (X-Request-Id) to
 * downstream services so the full distributed trace can be reconstructed.
 */
const requestIdMiddleware = (req, res, next) => {
  // Accept a forwarded request ID (e.g. from API gateway) or generate a new one
  req.requestId = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
};

export default requestIdMiddleware;
