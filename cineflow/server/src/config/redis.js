import Redis from 'ioredis';

export const getRedisConnectionUrl = () => {
  let url = (process.env.REDIS_URL || 'redis://localhost:6380').trim();

  // If user copied the full `redis-cli ... -u <url>` command, extract only the URL
  if (url.includes('-u ')) {
    url = url.split('-u ')[1].trim();
  }

  // Remove any leading/trailing quotes
  url = url.replace(/^['"]+|['"]+$/g, '');

  // Upstash requires TLS (rediss://)
  if (url.includes('upstash.io') && url.startsWith('redis://')) {
    url = url.replace(/^redis:\/\//, 'rediss://');
  }

  return url;
};

const createRedisClient = () => {
  const redisUrl = getRedisConnectionUrl();
  const useTls = redisUrl.startsWith('rediss://');

  const client = new Redis(redisUrl, {
    retryStrategy(times) {
      // If running in cloud container (Render) where localhost does not exist, stop retrying after 3 attempts
      if (times > 3 && (redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1'))) {
        console.warn('[Redis] Localhost Redis is unavailable. Stopping retries. Set REDIS_URL to a cloud Redis instance (e.g. Upstash or Render Redis).');
        return null;
      }
      return Math.min(times * 1000, 5000);
    },
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    lazyConnect: true,
    ...(useTls && { tls: {} }),
  });

  const logUrl = redisUrl.replace(/:([^:@/]+)@/, ':***@');
  client.on('connect', () => console.log(`[Redis] Connected to ${logUrl}`));
  client.on('ready', () => console.log('[Redis] Client ready'));
  client.on('error', (err) => {
    // Only log once or non-ECONNREFUSED errors to prevent log flooding
    if (err.code !== 'ECONNREFUSED') {
      console.error('[Redis] Error:', err.message);
    }
  });
  client.on('close', () => console.warn('[Redis] Connection closed'));

  // Attempt initial connect safely
  client.connect().catch(() => {
    console.warn('[Redis] Could not connect to Redis at ' + logUrl + '. Running in degraded mode without cache/rate-limit.');
  });

  return client;
};

const redis = createRedisClient();

export default redis;
