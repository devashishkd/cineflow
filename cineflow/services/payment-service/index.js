import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sequelize from './src/config/db.js';
import Payment from './src/models/payment.model.js';
import startPaymentWorker from './src/events/worker.js';
import paymentRoutes from './src/routes/payment.routes.js';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Payment Service is running' });
});

const start = async () => {
  try {
    // Connect to DB and sync models
    await sequelize.authenticate();
    console.log('✅ Payment DB connected');
    await Payment.sync({ alter: true });
    console.log('✅ Payment tables synced');

    // Start Kafka worker
    await startPaymentWorker();
    
    // Start HTTP Server
    app.listen(PORT, () => {
      console.log(`🚀 Payment Service running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Payment Service startup failed:', err);
    process.exit(1);
  }
};

start();
