/**
 * env.js — Validates required environment variables at startup.
 * Throws an error immediately if critical vars are missing so the
 * server fails fast with a clear message instead of at runtime.
 */

const REQUIRED = ['DB_URL', 'JWT_SECRET'];

const OPTIONAL_WITH_WARNINGS = [
  { key: 'REDIS_URL',            warn: 'Rate limiting and caching will be disabled.' },
  { key: 'RAZORPAY_KEY_ID',      warn: 'Payment endpoints will not work.' },
  { key: 'RAZORPAY_KEY_SECRET',  warn: 'Payment endpoints will not work.' },
  { key: 'SMTP_USER',            warn: 'Email notifications will be skipped.' },
  { key: 'SMTP_PASS',            warn: 'Email notifications will be skipped.' },
  { key: 'KAFKA_BROKER',         warn: 'Analytics events will not be published to Kafka.' },
];

export const validateEnv = () => {
  const missing = REQUIRED.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `[ENV] Missing required environment variables: ${missing.join(', ')}\n` +
      `Please set them in your .env file.`
    );
  }

  for (const { key, warn } of OPTIONAL_WITH_WARNINGS) {
    if (!process.env[key]) {
      console.warn(`[ENV] Warning: ${key} is not set. ${warn}`);
    }
  }

  console.log('[ENV] Environment validated ✅');
};
