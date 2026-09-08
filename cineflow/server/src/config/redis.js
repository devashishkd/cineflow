import Redis from 'ioredis';

export const getRedisConnectionUrl = () =>
  process.env.REDIS_URL || 'redis://localhost:6379';

const createRedisClient = () => {
  const redisUrl = getRedisConnectionUrl();
  const useTls = redisUrl.startsWith('rediss://');

  const client = new Redis(redisUrl, {
    retryStrategy(times) {
      return Math.min(times * 200, 5000);
    },
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: false,
    ...(useTls && { tls: {} }),
  });

  const logUrl = redisUrl.replace(/:([^:@/]+)@/, ':***@');
  client.on('connect', () => console.log(`[Redis] Connected to ${logUrl}`));
  client.on('ready', () => console.log('[Redis] Client ready'));
  client.on('error', (err) => console.error('[Redis] Error:', err.message));
  client.on('close', () => console.warn('[Redis] Connection closed'));

  return client;
};

const redis = createRedisClient();

export default redis;
