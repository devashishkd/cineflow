import 'dotenv/config';
import startNotificationWorker from './src/events/worker.js';

const start = async () => {
  try {
    await startNotificationWorker();
    console.log('🚀 Notification Service running (Kafka worker mode, no HTTP)');
  } catch (err) {
    console.error('❌ Notification Service startup failed:', err);
    process.exit(1);
  }
};

start();
