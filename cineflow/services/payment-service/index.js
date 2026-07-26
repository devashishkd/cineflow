import 'dotenv/config';
import sequelize from './src/config/db.js';
import Payment from './src/models/payment.model.js';
import startPaymentWorker from './src/events/worker.js';

const start = async () => {
  try {
    // Connect to DB and sync models
    await sequelize.authenticate();
    console.log('✅ Payment DB connected');
    await Payment.sync({ alter: true });
    console.log('✅ Payment tables synced');

    // Start Kafka worker
    await startPaymentWorker();

    console.log('🚀 Payment Service running (Kafka worker mode)');
  } catch (err) {
    console.error('❌ Payment Service startup failed:', err);
    process.exit(1);
  }
};

start();
