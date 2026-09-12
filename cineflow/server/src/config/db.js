import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // Atlas (mongodb+srv://) connections require TLS; local ones don't.
  const isAtlas = uri?.startsWith('mongodb+srv://');

  const options = {
    dbName: 'cineflow',
    ...(isAtlas ? { tls: true, tlsAllowInvalidCertificates: false } : {}),
  };

  try {
    await mongoose.connect(uri, options);
    logger.info('✅ MongoDB connected successfully.', { source: 'database' });
    return { connected: true };
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`, { source: 'database' });
    return { connected: false, error };
  }
};

export default mongoose;
