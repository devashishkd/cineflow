/**
 * asyncHandler.js
 *
 * Wraps an async Express route handler and forwards any rejected promise
 * to next(err), so controllers never need try-catch boilerplate.
 *
 * Usage:
 *   router.post('/', asyncHandler(async (req, res) => { ... }));
 *
 * Interview talking point:
 * - Without this, every controller has the same try-catch pattern which is
 *   error-prone (forgetting next(err) sends an unhandled rejection).
 * - This is a thin decorator — zero dependencies, easy to reason about.
 */

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
