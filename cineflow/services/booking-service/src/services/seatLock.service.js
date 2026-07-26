import redis from '../config/redis.js';

/**
 * Seat Locking Service — Phase 2
 *
 * Uses Redis SET NX EX (atomic "set if not exists" with expiry) to prevent
 * race conditions when two users try to book the same seat simultaneously.
 *
 * Lock key format: `seat:lock:<seatId>`
 * Lock value:      userId — so only the locking user (or cleanup) can release it
 * Default TTL:     600 seconds (10 minutes) — time the user has to complete payment
 *
 * Why SET NX EX and not SETNX + EXPIRE (two commands)?
 *   Two separate commands are NOT atomic — a crash between them leaves a key
 *   with no TTL (permanent lock). SET NX EX is a single atomic operation.
 */

const LOCK_TTL_SECONDS = 600; // 10 minutes
const LOCK_PREFIX = 'seat:lock:';

/**
 * Attempt to lock all requested seats for a given user.
 *
 * Fails fast (no partial locks) if any seat is already locked:
 *   1. Try to SET NX EX on all seats
 *   2. If any seat was already locked → release the ones we just acquired + throw
 *
 * @param {string[]} seatIds   - Array of seat UUIDs to lock
 * @param {string}   userId    - UUID of the user acquiring the lock
 * @param {number}   [ttl]     - TTL in seconds (default: 600)
 * @returns {Promise<void>}
 * @throws {Error} if any seat is already locked by another user
 */
const lockSeats = async (seatIds, userId, ttl = LOCK_TTL_SECONDS) => {
  const acquiredKeys = [];

  try {
    for (const seatId of seatIds) {
      const key = `${LOCK_PREFIX}${seatId}`;
      // SET key value NX EX ttl — returns 'OK' on success, null if key already exists
      const result = await redis.set(key, userId, 'NX', 'EX', ttl);

      if (result === 'OK') {
        acquiredKeys.push(key);
      } else {
        // Seat is already locked by someone else — roll back all acquired locks
        if (acquiredKeys.length > 0) {
          await redis.del(...acquiredKeys);
        }
        throw new Error(
          `Seat ${seatId} is temporarily locked by another user. Please try again shortly.`
        );
      }
    }
  } catch (err) {
    // Re-throw after cleanup
    throw err;
  }
};

/**
 * Release locks for the given seats.
 * Called after a booking is confirmed or on error rollback.
 *
 * NOTE: We don't check ownership here because:
 *   a) Only the booking-service calls this (trusted internal call)
 *   b) Confirmed bookings have the seat marked BOOKED in DB — lock is redundant anyway
 *
 * @param {string[]} seatIds - Array of seat UUIDs to unlock
 * @returns {Promise<void>}
 */
const releaseSeats = async (seatIds) => {
  if (!seatIds || seatIds.length === 0) return;

  try {
    const keys = seatIds.map((id) => `${LOCK_PREFIX}${id}`);
    await redis.del(...keys);
    console.log(`[SeatLock] Released ${keys.length} seat lock(s)`);
  } catch (err) {
    // Non-critical — locks will expire via TTL anyway
    console.error('[SeatLock] Error releasing locks:', err.message);
  }
};

/**
 * Check if a specific seat is currently locked.
 * Useful for the seat grid UI to show "Temporarily Unavailable" state.
 *
 * @param {string} seatId
 * @returns {Promise<boolean>}
 */
const isSeatLocked = async (seatId) => {
  try {
    const value = await redis.get(`${LOCK_PREFIX}${seatId}`);
    return value !== null;
  } catch (err) {
    console.error('[SeatLock] Error checking lock:', err.message);
    return false; // fail open
  }
};

export default { lockSeats, releaseSeats, isSeatLocked };
