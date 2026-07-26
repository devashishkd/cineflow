import redis from '../config/redis.js';

/**
 * Redis sliding-window rate limiter middleware.
 *
 * Strategy: INCR + EXPIRE (fixed-window per minute per IP)
 *   - Key format: `ratelimit:<ip>`
 *   - Window: 60 seconds
 *   - Limit: 100 requests per window
 *
 * Why INCR + EXPIRE instead of a sorted-set sliding window?
 *   - INCR is O(1) and simpler to reason about
 *   - Fixed-window is sufficient for placement-level demos
 *   - A true sliding window (ZADD/ZREMRANGEBYSCORE) can be added in Phase 3+
 *
 * Response headers added (like GitHub's API):
 *   X-RateLimit-Limit    — max requests per window
 *   X-RateLimit-Remaining — how many are left
 *   Retry-After          — seconds until window resets (on 429 only)
 */

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 100;

const rateLimitMiddleware = async (req, res, next) => {
  // Use X-Forwarded-For in production behind a load balancer; fallback to socket IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  const key = `ratelimit:${ip}`;

  try {
    // INCR atomically increments; returns 1 on first call for this key
    const requests = await redis.incr(key);

    // Set the expiry only on the first request in this window
    if (requests === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    const remaining = Math.max(0, MAX_REQUESTS - requests);

    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (requests > MAX_REQUESTS) {
      const ttl = await redis.ttl(key);
      res.setHeader('Retry-After', ttl);
      return res.status(429).json({
        success: false,
        message: `Too many requests. Limit: ${MAX_REQUESTS} per minute. Try again in ${ttl}s.`,
      });
    }

    next();
  } catch (err) {
    // If Redis is down, fail open so the gateway doesn't become a single point of failure
    console.error('[RateLimit] Redis error — failing open:', err.message);
    next();
  }
};

export default rateLimitMiddleware;
