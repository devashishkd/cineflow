import { createRedisClient } from '../../../shared/redis/redisClient.js';

// Singleton — one connection for the entire movie-service process
const redis = createRedisClient();

export default redis;
