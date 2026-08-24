import Redis from 'ioredis';

/**
 * Single shared Redis client for the entire monolith.
 * Used by: rate-limit middleware, movie/show cache, seat locking.
 */
const createRedisClient = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  const client = new Redis(redisUrl, {
    retryStrategy(times) {
      return Math.min(times * 200, 5000);
    },
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  client.on('connect', () => console.log(`[Redis] Connected to ${redisUrl}`));
  client.on('ready',   () => console.log('[Redis] Client ready'));
  client.on('error',   (err) => console.error('[Redis] Error:', err.message));
  client.on('close',   () => console.warn('[Redis] Connection closed'));

  return client;
};

const redis = createRedisClient();

export default redis;
