import express from 'express';
import cors from 'cors';
import movieRoutes from './routes/movie.routes.js';
import showRoutes from './routes/show.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/shows', showRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Movie Service is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;
