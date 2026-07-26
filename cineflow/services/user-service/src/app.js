import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'User Service is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;
