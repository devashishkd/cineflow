import test from 'node:test';
import assert from 'node:assert/strict';
import 'dotenv/config';

import { connectDB } from '../../config/db.js';
import User from './user.model.js';
import authService from './auth.service.js';

test('register accepts ADMIN role and login returns admin token', async () => {
  await connectDB();

  const email = `admin-${Date.now()}@example.com`;
  const registered = await authService.register({
    name: 'Admin Test',
    email,
    password: 'password123',
    role: 'ADMIN',
  });

  assert.equal(registered.role, 'ADMIN');

  const loggedIn = await authService.login({ email, password: 'password123' });
  assert.equal(loggedIn.user.role, 'ADMIN');
  assert.ok(loggedIn.token);

  await User.destroy({ where: { email } });
});
