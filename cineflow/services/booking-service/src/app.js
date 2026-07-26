import express from 'express';
import cors from 'cors';
import bookingRoutes from './routes/booking.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Booking Service is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;
