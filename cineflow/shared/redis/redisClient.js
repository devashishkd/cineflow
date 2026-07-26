import Redis from 'ioredis';

/**
 * Creates and returns a configured ioredis client.
 *
 * Usage (in any service):
 *   import { createRedisClient } from '../../shared/redis/redisClient.js';
 *   const redis = createRedisClient();
 *
 * The client automatically:
 *   - Reconnects on disconnect (maxRetriesPerRequest: null lets ioredis retry indefinitely)
 *   - Logs connection events for visibility
 *   - Fails fast in tests by reading REDIS_URL from env
 */
const createRedisClient = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  const client = new Redis(redisUrl, {
    // Retry strategy: exponential back-off up to 5 s between attempts
    retryStrategy(times) {
      const delay = Math.min(times * 200, 5000);
      return delay;
    },
    maxRetriesPerRequest: null, // required for blocking commands in ioredis v5+
    enableReadyCheck: true,
    lazyConnect: false,
  });

  client.on('connect', () => {
    console.log(`[Redis] Connected to ${redisUrl}`);
  });

  client.on('ready', () => {
    console.log('[Redis] Client ready');
  });

  client.on('error', (err) => {
    console.error('[Redis] Error:', err.message);
  });

  client.on('close', () => {
    console.warn('[Redis] Connection closed');
  });

  return client;
};

export { createRedisClient };
