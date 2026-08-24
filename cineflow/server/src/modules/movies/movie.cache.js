import redis from '../../config/redis.js';

/**
 * Redis cache helpers for the movies module.
 *
 * Key patterns:
 *   movies:all:<genre>:<language>:<city>:<status>  — movie list results
 *   show:<showId>                                   — individual show details
 */

export const MOVIES_CACHE_TTL = 5 * 60; // 5 minutes
export const SHOW_CACHE_TTL   = 2 * 60; // 2 minutes

// ─── Movie list cache ─────────────────────────────────────────────────────────

export const getMoviesCache = async (key) => {
  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`[Cache HIT] ${key}`);
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error('[Cache] Redis GET error:', err.message);
  }
  return null;
};

export const setMoviesCache = async (key, data) => {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', MOVIES_CACHE_TTL);
    console.log(`[Cache SET] ${key} (TTL: ${MOVIES_CACHE_TTL}s)`);
  } catch (err) {
    console.error('[Cache] Redis SET error:', err.message);
  }
};

export const invalidateMoviesCache = async () => {
  try {
    let cursor = '0';
    let deletedCount = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', 'movies:all:*', 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
        deletedCount += keys.length;
      }
    } while (cursor !== '0');
    console.log(`[Cache INVALIDATE] movies:all:* (${deletedCount} keys)`);
  } catch (err) {
    console.error('[Cache] Redis INVALIDATE error:', err.message);
  }
};

// ─── Show cache ───────────────────────────────────────────────────────────────

export const getShowCache = async (showId) => {
  try {
    const cached = await redis.get(`show:${showId}`);
    if (cached) {
      console.log(`[Cache HIT] show:${showId}`);
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error('[Cache] Redis GET error:', err.message);
  }
  return null;
};

export const setShowCache = async (showId, data) => {
  try {
    await redis.set(`show:${showId}`, JSON.stringify(data), 'EX', SHOW_CACHE_TTL);
    console.log(`[Cache SET] show:${showId} (TTL: ${SHOW_CACHE_TTL}s)`);
  } catch (err) {
    console.error('[Cache] Redis SET error:', err.message);
  }
};

export const invalidateShowCache = async (showId) => {
  try {
    await redis.del(`show:${showId}`);
    console.log(`[Cache INVALIDATE] show:${showId}`);
  } catch (err) {
    console.error('[Cache] Redis INVALIDATE error:', err.message);
  }
};
