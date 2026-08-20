import 'dotenv/config';
import { sequelize, Movie, Theatre, Show, Seat } from './src/models/index.js';

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database for seeding...');

    await sequelize.sync({ force: true }); 
    console.log('🌱 Dropped and recreated tables...');

    console.log('🌱 Seeding movies (10 movies)...');
    const movies = await Movie.bulkCreate([
      { title: 'Inception', description: 'Dream-sharing technology.', genre: 'Sci-Fi', language: 'English', releaseDate: '2010-07-16', duration: 148, rating: 8.8, posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg' },
      { title: 'Interstellar', description: 'Space exploration.', genre: 'Sci-Fi', language: 'English', releaseDate: '2014-11-07', duration: 169, rating: 8.6, posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
      { title: 'The Dark Knight', description: 'Batman vs Joker.', genre: 'Action', language: 'English', releaseDate: '2008-07-18', duration: 152, rating: 9.0, posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
      { title: 'Oppenheimer', description: 'Atomic bomb creator.', genre: 'Biography', language: 'English', releaseDate: '2023-07-21', duration: 180, rating: 8.4, posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' },
      { title: 'Dune: Part Two', description: 'Return to Arrakis.', genre: 'Sci-Fi', language: 'English', releaseDate: '2024-03-01', duration: 166, rating: 8.7, posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2IGpbafS0.jpg' },
      { title: 'RRR', description: 'Epic historical action.', genre: 'Action', language: 'Telugu', releaseDate: '2022-03-24', duration: 187, rating: 7.8, posterUrl: 'https://image.tmdb.org/t/p/w500/wE71Qjhe81k2hnAba6LItXf9rQO.jpg' },
      { title: 'Avatar: The Way of Water', description: 'Pandora oceans.', genre: 'Sci-Fi', language: 'English', releaseDate: '2022-12-16', duration: 192, rating: 7.6, posterUrl: 'https://image.tmdb.org/t/p/w500/t6HIqrBUclAc1XtT8WHNqIeR8gV.jpg' },
      { title: 'Spider-Man: Across the Spider-Verse', description: 'Multiverse adventure.', genre: 'Animation', language: 'English', releaseDate: '2023-06-02', duration: 140, rating: 8.7, posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg' },
      { title: 'Kalki 2898 AD', description: 'Dystopian future.', genre: 'Sci-Fi', language: 'Telugu', releaseDate: '2024-06-27', duration: 180, rating: 8.0, posterUrl: 'https://image.tmdb.org/t/p/w500/kZJEqhS8Xk8G4R9G9t3c4J1YQ7c.jpg' },
      { title: 'Deadpool & Wolverine', description: 'Marvel chaos.', genre: 'Action', language: 'English', releaseDate: '2024-07-26', duration: 128, rating: 8.2, posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg' }
    ]);

    console.log('🌱 Seeding theatres in many cities including Ahmedabad...');
    const theatres = await Theatre.bulkCreate([
      { name: 'PVR Acropolis', city: 'Ahmedabad', address: 'Thaltej', totalScreens: 6 },
      { name: 'Cinepolis AlphaOne', city: 'Ahmedabad', address: 'Vastrapur', totalScreens: 5 },
      { name: 'AMC Empire 25', city: 'New York', address: '234 W 42nd St', totalScreens: 10 },
      { name: 'Regal LA Live', city: 'Los Angeles', address: '1000 W Olympic Blvd', totalScreens: 8 },
      { name: 'Alamo Drafthouse', city: 'San Francisco', address: '2550 Mission St', totalScreens: 5 },
      { name: 'PVR Nexus', city: 'Bengaluru', address: 'Koramangala', totalScreens: 7 },
      { name: 'INOX Megaplex', city: 'Mumbai', address: 'Malad', totalScreens: 11 },
      { name: 'Cinepolis', city: 'Delhi', address: 'Saket', totalScreens: 6 }
    ]);

    console.log('🌱 Seeding huge amount of shows and seats... (This will take a moment)');
    // 3 days of shows
    const showDates = ['2026-08-21', '2026-08-22', '2026-08-23'];
    // 6 showtimes per day
    const showTimes = ['09:00:00', '12:30:00', '16:00:00', '19:30:00', '22:45:00'];
    
    // Rows: A to E (5 rows), 15 seats per row = 75 seats per show
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const SEATS_PER_ROW = 15;
    
    const showsToCreate = [];
    // We will assign a subset of movies to each theatre to keep it somewhat realistic, but large.
    // Let's just put EVERY movie in EVERY theatre for max data.
    for (const theatre of theatres) {
      for (const movie of movies) {
        for (const date of showDates) {
          for (const time of showTimes) {
            showsToCreate.push({
              movieId: movie.id,
              theatreId: theatre.id,
              showDate: date,
              showTime: time,
              price: Math.floor(Math.random() * (25 - 10 + 1) + 10) + 0.50, // random price between 10.50 and 25.50
              totalSeats: rows.length * SEATS_PER_ROW
            });
          }
        }
      }
    }

    console.log(`Inserting ${showsToCreate.length} shows...`);
    const createdShows = await Show.bulkCreate(showsToCreate, { returning: true });

    // Creating seats in batches to avoid running out of memory or hitting DB limits
    console.log(`Generating seats for ${createdShows.length} shows...`);
    const BATCH_SIZE = 5000;
    let seatsBatch = [];
    
    let totalSeatsInserted = 0;
    
    for (let s = 0; s < createdShows.length; s++) {
      const show = createdShows[s];
      for (const row of rows) {
        for (let i = 1; i <= SEATS_PER_ROW; i++) {
          seatsBatch.push({
            showId: show.id,
            seatNumber: `${row}${i}`,
            row: row,
            status: Math.random() > 0.85 ? 'BOOKED' : 'AVAILABLE' // pre-book ~15% of seats randomly
          });
        }
      }

      if (seatsBatch.length >= BATCH_SIZE || s === createdShows.length - 1) {
        await Seat.bulkCreate(seatsBatch);
        totalSeatsInserted += seatsBatch.length;
        console.log(`Inserted ${totalSeatsInserted} seats...`);
        seatsBatch = [];
      }
    }

    console.log(`🎉 Seeding completed successfully! Movies: ${movies.length}, Theatres: ${theatres.length}, Shows: ${createdShows.length}, Seats: ${totalSeatsInserted}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
