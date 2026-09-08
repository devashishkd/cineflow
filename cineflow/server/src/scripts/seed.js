import 'dotenv/config';
import { connectDB } from '../config/db.js';
import User from '../modules/auth/user.model.js';
import Movie from '../modules/movies/movie.model.js';
import Theatre from '../modules/theatres/theatre.model.js';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Clearing old data...');
    await User.destroy({ where: {} });
    await Movie.destroy({ where: {} });
    await Theatre.destroy({ where: {} });
    
    console.log('Creating Admin User...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@cineflow.com',
      password: 'password123', // Model hook should hash this
      role: 'ADMIN'
    });

    console.log('Creating Regular User...');
    const user = await User.create({
      name: 'Test User',
      email: 'user@cineflow.com',
      password: 'password123', // Model hook should hash this
      role: 'USER'
    });

    console.log('Creating Sample Movies...');
    const m1 = await Movie.create({
      title: 'Inception',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
      duration: 148,
      language: 'English',
      genre: 'Sci-Fi',
      releaseDate: '2010-07-16',
      posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg'
    });

    const m2 = await Movie.create({
      title: 'The Dark Knight',
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham.',
      duration: 152,
      language: 'English',
      genre: 'Action',
      releaseDate: '2008-07-18',
      posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
    });

    console.log('Creating Sample Theatres...');
    const t1 = await Theatre.create({
      name: 'PVR Cinemas',
      city: 'Mumbai',
      address: 'Phoenix Marketcity, Kurla',
      capacity: 300
    });

    const t2 = await Theatre.create({
      name: 'Cinepolis',
      city: 'Delhi',
      address: 'DLF Avenue, Saket',
      capacity: 250
    });

    console.log('----------------------------------------------------');
    console.log('✅ SEED SUCCESSFUL');
    console.log('Admin Account: admin@cineflow.com / password123');
    console.log('User Account: user@cineflow.com / password123');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ SEED FAILED:', error);
    process.exit(1);
  }
};

seedDatabase();
