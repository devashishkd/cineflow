import redis from '../config/redis.js';

/**
 * Redis fixed-window rate limiter (100 req/min per IP).
 *
 * Key: `ratelimit:<ip>` — incremented per request, expires after 60s.
 * Fails open if Redis is unavailable so the server never hard-blocks.
 */

const WINDOW_SECONDS = 60;
const MAX_REQUESTS   = 100;

const rateLimitMiddleware = async (req, res, next) => {
  const ip  = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  const key = `ratelimit:${ip}`;

  try {
    const requests = await redis.incr(key);

    if (requests === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    const remaining = Math.max(0, MAX_REQUESTS - requests);
    res.setHeader('X-RateLimit-Limit',     MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (requests > MAX_REQUESTS) {
      const ttl = await redis.ttl(key);
      res.setHeader('Retry-After', ttl);
      return res.status(429).json({
        success: false,
        message: `Too many requests. Limit: ${MAX_REQUESTS}/min. Retry in ${ttl}s.`,
      });
    }

    next();
  } catch (err) {
    // Fail open — don't let a Redis outage take down the API
    console.error('[RateLimit] Redis error — failing open:', err.message);
    next();
  }
};

export default rateLimitMiddleware;
