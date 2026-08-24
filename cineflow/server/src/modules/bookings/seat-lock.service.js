import redis from '../../config/redis.js';

/**
 * Seat Locking Service
 *
 * Uses Redis SET NX EX (atomic) to prevent race conditions when two users
 * try to book the same seat simultaneously.
 *
 * Lock key: `seat:lock:<seatId>`
 * Lock value: userId
 * TTL: 600 seconds (10 minutes) — time the user has to complete payment
 */

const LOCK_TTL_SECONDS = 600;
const LOCK_PREFIX = 'seat:lock:';

/**
 * Lock all requested seats for a given user.
 * Fails atomically if any seat is already locked — releases any
 * locks already acquired in this call.
 */
export const lockSeats = async (seatIds, userId, ttl = LOCK_TTL_SECONDS) => {
  const acquiredKeys = [];

  for (const seatId of seatIds) {
    const key = `${LOCK_PREFIX}${seatId}`;
    const result = await redis.set(key, userId, 'NX', 'EX', ttl);

    if (result === 'OK') {
      acquiredKeys.push(key);
    } else {
      // Roll back locks already acquired in this call
      if (acquiredKeys.length > 0) await redis.del(...acquiredKeys);
      throw new Error(`Seat ${seatId} is temporarily locked by another user. Please try again.`);
    }
  }
};

/**
 * Release Redis locks for the given seats.
 */
export const releaseSeats = async (seatIds) => {
  if (!seatIds || seatIds.length === 0) return;
  try {
    const keys = seatIds.map((id) => `${LOCK_PREFIX}${id}`);
    await redis.del(...keys);
    console.log(`[SeatLock] Released ${keys.length} seat lock(s)`);
  } catch (err) {
    console.error('[SeatLock] Error releasing locks:', err.message);
  }
};

/**
 * Check if a specific seat is currently locked.
 */
export const isSeatLocked = async (seatId) => {
  try {
    const value = await redis.get(`${LOCK_PREFIX}${seatId}`);
    return value !== null;
  } catch (err) {
    console.error('[SeatLock] Error checking lock:', err.message);
    return false;
  }
};

export default { lockSeats, releaseSeats, isSeatLocked };
