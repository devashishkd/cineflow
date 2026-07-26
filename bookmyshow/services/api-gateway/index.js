import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`   Forwarding:`);
  console.log(`   /api/auth      → ${process.env.USER_SERVICE_URL}`);
  console.log(`   /api/movies    → ${process.env.MOVIE_SERVICE_URL}`);
  console.log(`   /api/shows     → ${process.env.MOVIE_SERVICE_URL}`);
  console.log(`   /api/bookings  → ${process.env.BOOKING_SERVICE_URL}`);
});
