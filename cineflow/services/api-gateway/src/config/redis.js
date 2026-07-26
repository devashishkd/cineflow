import { createRedisClient } from '../../../shared/redis/redisClient.js';

// Singleton — one connection for the entire gateway process
const redis = createRedisClient();

export default redis;
