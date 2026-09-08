import redis from '../../config/redis.js';

/**
 * Seat Locking Service
 *
 * Uses a Redis Lua script to atomically lock ALL requested seats in a single
 * round-trip. This eliminates the race condition in a sequential loop.
 *
 * Lock key: `seat:lock:<seatId>`
 * Lock value: userId
 * TTL: LOCK_TTL_SECONDS
 *
 * ─── Why Lua? ────────────────────────────────────────────────────────────────
 * Redis executes Lua scripts atomically — no other command runs between lines
 * of the script. This makes it the correct primitive for a "lock all or none"
 * operation on multiple keys.
 *
 * Interview scenarios:
 *
 * Q: Two users try to book seats A1 and A2 simultaneously. What happens?
 * A: Both run the Lua script. Redis serializes them. The first script to run
 *    acquires all locks (SET NX succeeds). The second finds at least one
 *    seat already locked and rolls back by DEL-ing any it acquired — all in
 *    the same atomic script execution.
 *
 * Q: What if Redis crashes after locking but before booking is created?
 * A: On restart, the lock keys are gone. The seat status in MongoDB is still
 *    AVAILABLE (we only write BOOKED to Mongo after payment confirms).
 *    A new booking request can proceed. The original client gets an error
 *    and must retry. No data is corrupted.
 *
 * Q: What if Redis is unavailable?
 * A: lockSeats throws, createBooking catches it and returns 503.
 *    We fail-closed here (unlike rate limiting which fails-open) because
 *    allowing a booking without a lock risks double-booking.
 */

const LOCK_TTL_SECONDS = 600; // 10 minutes — time the user has to complete payment
const LOCK_PREFIX = 'seat:lock:';

/**
 * Lua script: lock all seats atomically or none.
 *
 * KEYS = ['seat:lock:id1', 'seat:lock:id2', ...]
 * ARGV = [userId, ttl, 'seat:lock:id1', 'seat:lock:id2', ...]
 *   (ARGV repeats the keys so we can DEL them on rollback without KEYS trickery)
 *
 * Returns 1 on full success, or the first locked seatId string on failure.
 */
const LOCK_SCRIPT = `
local acquired = {}
local userId = ARGV[1]
local ttl = tonumber(ARGV[2])

for i = 1, #KEYS do
  local result = redis.call('SET', KEYS[i], userId, 'NX', 'EX', ttl)
  if result then
    table.insert(acquired, KEYS[i])
  else
    -- Rollback: release any keys we just acquired
    if #acquired > 0 then
      redis.call('DEL', unpack(acquired))
    end
    -- Return the key that blocked us (for a useful error message)
    return KEYS[i]
  end
end
return 'OK'
`;

/**
 * Lock all requested seats for a given user atomically.
 * Throws if any seat is already locked.
 *
 * @param {string[]} seatIds   - Array of MongoDB seat ObjectId strings
 * @param {string}   userId    - The locking user's ID
 * @param {number}   ttl       - Lock TTL in seconds (default: LOCK_TTL_SECONDS)
 */
export const lockSeats = async (seatIds, userId, ttl = LOCK_TTL_SECONDS) => {
  if (!seatIds || seatIds.length === 0) return;

  const keys = seatIds.map((id) => `${LOCK_PREFIX}${id}`);

  // redis.eval(script, numkeys, key1, key2, ..., arg1, arg2, ...)
  const result = await redis.eval(
    LOCK_SCRIPT,
    keys.length,
    ...keys,
    userId,
    ttl
  );

  if (result !== 'OK') {
    // result is the key that was already locked — extract the seatId
    const blockedSeatId = result.replace(LOCK_PREFIX, '');
    throw new Error(
      `Seat ${blockedSeatId} is temporarily held by another user. Please select a different seat or try again in a few minutes.`
    );
  }

  console.log(`[SeatLock] 🔒 Locked ${seatIds.length} seat(s) for user ${userId} (TTL: ${ttl}s)`);
};

/**
 * Release Redis locks for the given seats.
 * Safe to call even if the lock has already expired — DEL is idempotent.
 */
export const releaseSeats = async (seatIds) => {
  if (!seatIds || seatIds.length === 0) return;
  try {
    const keys = seatIds.map((id) => `${LOCK_PREFIX}${id}`);
    const deleted = await redis.del(...keys);
    console.log(`[SeatLock] 🔓 Released ${deleted}/${keys.length} seat lock(s)`);
  } catch (err) {
    console.error('[SeatLock] Error releasing locks:', err.message);
  }
};

/**
 * Check if a specific seat is currently locked.
 * Returns { locked: boolean, lockedByUserId: string|null }
 */
export const isSeatLocked = async (seatId) => {
  try {
    const value = await redis.get(`${LOCK_PREFIX}${seatId}`);
    return { locked: value !== null, lockedByUserId: value };
  } catch (err) {
    console.error('[SeatLock] Error checking lock:', err.message);
    return { locked: false, lockedByUserId: null };
  }
};

/**
 * Get the remaining TTL (seconds) on a seat lock.
 * Returns 0 if the lock has expired or doesn't exist.
 */
export const getSeatLockTTL = async (seatId) => {
  try {
    const ttl = await redis.ttl(`${LOCK_PREFIX}${seatId}`);
    return ttl > 0 ? ttl : 0;
  } catch (err) {
    console.error('[SeatLock] Error getting TTL:', err.message);
    return 0;
  }
};

export default { lockSeats, releaseSeats, isSeatLocked, getSeatLockTTL };
