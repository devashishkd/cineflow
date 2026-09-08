import redis from '../../config/redis.js';

/**
 * Redis Cache Helpers — Movies Module
 *
 * Key patterns:
 *   movies:v<n>:list:<filters>   — versioned movie list results
 *   show:meta:<showId>           — show METADATA only (no seat status)
 *
 * ─── Version-Tag Invalidation Strategy ────────────────────────────────────────
 * Problem with SCAN-based invalidation:
 *   SCAN is O(N) over the full keyspace — slow and blocks Redis in large datasets.
 *   Also anti-pattern: never do expensive operations in the hot path.
 *
 * Solution: version counter.
 *   - movies:version = 7        (a simple integer in Redis)
 *   - Cache key = movies:v7:list:action:*:*:now_showing
 *   - To invalidate ALL movie caches: just INCR movies:version → 8
 *   - Old v7 keys become orphaned and expire naturally via their TTL.
 *   - No SCAN, no DEL loop, O(1) invalidation.
 *
 * Interview: This is the "cache versioning" or "generation counter" pattern.
 * Same concept used by CDNs (cache-busting URLs) and browser caches.
 * Trade-off: orphaned keys accumulate until TTL expires. With a 5-min TTL,
 * max wasted memory = 5 minutes of stale entries per invalidation.
 * Acceptable for our use case; for tighter memory budgets, use Redis keyspace
 * notifications + lazy deletion instead.
 */

export const MOVIES_CACHE_TTL = 5 * 60;   // 5 minutes
export const SHOW_CACHE_TTL   = 10 * 60;  // 10 minutes (metadata only, safe to cache longer)
const VERSION_KEY = 'movies:version';

// ─── Version helpers ──────────────────────────────────────────────────────────

const getCurrentVersion = async () => {
  try {
    const v = await redis.get(VERSION_KEY);
    return v || '1';
  } catch {
    return '1'; // fail open — cache miss is fine
  }
};

const buildMoviesKey = async (filters) => {
  const version = await getCurrentVersion();
  const { genre = '*', language = '*', city = '*', status = '*', q = '*', page = '1', limit = '20' } = filters;
  return `movies:v${version}:list:${genre}:${language}:${city}:${status}:${q}:${page}:${limit}`;
};

// ─── Movie list cache ─────────────────────────────────────────────────────────

export const getMoviesCache = async (filters) => {
  try {
    const key = await buildMoviesKey(filters);
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

export const setMoviesCache = async (filters, data) => {
  try {
    const key = await buildMoviesKey(filters);
    await redis.set(key, JSON.stringify(data), 'EX', MOVIES_CACHE_TTL);
    console.log(`[Cache SET] ${key} (TTL: ${MOVIES_CACHE_TTL}s)`);
  } catch (err) {
    console.error('[Cache] Redis SET error:', err.message);
  }
};

/**
 * Invalidate ALL movie list caches by bumping the version counter.
 * O(1) — no SCAN required.
 */
export const invalidateMoviesCache = async () => {
  try {
    const newVersion = await redis.incr(VERSION_KEY);
    console.log(`[Cache INVALIDATE] movies — bumped to version ${newVersion}`);
  } catch (err) {
    console.error('[Cache] Redis INVALIDATE error:', err.message);
  }
};

// ─── Show metadata cache (NO seat status included) ───────────────────────────

export const getShowCache = async (showId) => {
  try {
    const cached = await redis.get(`show:meta:${showId}`);
    if (cached) {
      console.log(`[Cache HIT] show:meta:${showId}`);
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error('[Cache] Redis GET error:', err.message);
  }
  return null;
};

export const setShowCache = async (showId, data) => {
  try {
    // Strip seat status before caching — seats must always come from MongoDB live
    const { seats: _seats, ...metaOnly } = data;
    await redis.set(`show:meta:${showId}`, JSON.stringify(metaOnly), 'EX', SHOW_CACHE_TTL);
    console.log(`[Cache SET] show:meta:${showId} (TTL: ${SHOW_CACHE_TTL}s)`);
  } catch (err) {
    console.error('[Cache] Redis SET error:', err.message);
  }
};

export const invalidateShowCache = async (showId) => {
  try {
    await redis.del(`show:meta:${showId}`);
    console.log(`[Cache INVALIDATE] show:meta:${showId}`);
  } catch (err) {
    console.error('[Cache] Redis INVALIDATE error:', err.message);
  }
};
