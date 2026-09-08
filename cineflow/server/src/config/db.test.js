import test from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL = 'postgresql://invalid:invalid@localhost:1/invalid';
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'development';

const { connectDB } = await import('./db.js');

test('connectDB reports connection failure without exiting the process', async () => {
  const result = await connectDB();

  assert.equal(result.connected, false);
  assert.ok(result.error);
});
