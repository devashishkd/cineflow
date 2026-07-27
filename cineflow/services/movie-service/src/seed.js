import { sequelize, Movie, Theatre, Show, Seat } from './models/index.js';

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    await sequelize.sync({ force: true });
    console.log('Database synced (force: true) - all tables dropped and recreated.');

    const moviesData = [
      // NOW SHOWING
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        genre: 'Action', language: 'English', duration: 152,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX400_.jpg',
        rating: 9.0, cast: 'Christian Bale, Heath Ledger, Aaron Eckhart', director: 'Christopher Nolan', producer: 'Emma Thomas',
        releaseDate: new Date(Date.now() - 30 * 864e5).toISOString().split('T')[0]
      },
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        genre: 'Sci-Fi', language: 'English', duration: 148,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX400_.jpg',
        rating: 8.8, cast: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Tom Hardy', director: 'Christopher Nolan', producer: 'Emma Thomas',
        releaseDate: new Date(Date.now() - 15 * 864e5).toISOString().split('T')[0]
      },
      {
        title: 'The Shawshank Redemption',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        genre: 'Drama', language: 'English', duration: 142,
        posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
        rating: 9.3, cast: 'Tim Robbins, Morgan Freeman, Bob Gunton', director: 'Frank Darabont', producer: 'Niki Marvin',
        releaseDate: new Date(Date.now() - 60 * 864e5).toISOString().split('T')[0]
      },
      {
        title: 'Parasite',
        description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
        genre: 'Thriller', language: 'Korean', duration: 132,
        posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
        rating: 8.5, cast: 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong', director: 'Bong Joon Ho', producer: 'Kwak Sin-ae',
        releaseDate: new Date(Date.now() - 5 * 864e5).toISOString().split('T')[0]
      },
      {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        genre: 'Sci-Fi', language: 'English', duration: 169,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_FMjpg_UX400_.jpg',
        rating: 8.6, cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain', director: 'Christopher Nolan', producer: 'Lynda Obst',
        releaseDate: new Date(Date.now() - 20 * 864e5).toISOString().split('T')[0]
      },
      {
        title: 'Avengers: Endgame',
        description: 'After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos\'s actions and restore the universe.',
        genre: 'Action', language: 'English', duration: 181,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_FMjpg_UX400_.jpg',
        rating: 8.4, cast: 'Robert Downey Jr., Chris Evans, Mark Ruffalo', director: 'Anthony Russo, Joe Russo', producer: 'Kevin Feige',
        releaseDate: new Date(Date.now() - 10 * 864e5).toISOString().split('T')[0]
      },
      {
        title: 'The Godfather',
        description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        genre: 'Crime', language: 'English', duration: 175,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_FMjpg_UX400_.jpg',
        rating: 9.2, cast: 'Marlon Brando, Al Pacino, James Caan', director: 'Francis Ford Coppola', producer: 'Albert S. Ruddy',
        releaseDate: new Date(Date.now() - 45 * 864e5).toISOString().split('T')[0]
      },
      {
        title: 'Joker',
        description: 'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded by society and embarks on a downward spiral of bloody crime.',
        genre: 'Drama', language: 'English', duration: 122,
        posterUrl: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
        rating: 8.4, cast: 'Joaquin Phoenix, Robert De Niro, Zazie Beetz', director: 'Todd Phillips', producer: 'Bradley Cooper',
        releaseDate: new Date(Date.now() - 25 * 864e5).toISOString().split('T')[0]
      },

      {
        title: 'La La Land',
        description: 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while reconciling their aspirations for the future.',
        genre: 'Romance', language: 'English', duration: 128,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BMzUzNDM2NzM2MV5BMl5BanBnXkFtZTgwNTM3NTg4OTE@._V1_FMjpg_UX400_.jpg',
        rating: 8.0, cast: 'Ryan Gosling, Emma Stone, John Legend', director: 'Damien Chazelle', producer: 'Marc Platt',
        releaseDate: new Date(Date.now() - 40 * 864e5).toISOString().split('T')[0]
      },
      {
        title: 'Oppenheimer',
        description: 'The story of J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
        genre: 'Drama', language: 'English', duration: 180,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_FMjpg_UX400_.jpg',
        rating: 8.3, cast: 'Cillian Murphy, Emily Blunt, Matt Damon', director: 'Christopher Nolan', producer: 'Emma Thomas',
        releaseDate: new Date(Date.now() - 8 * 864e5).toISOString().split('T')[0]
      },
      {
        title: 'Whiplash',
        description: 'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are tested by a ruthless instructor.',
        genre: 'Drama', language: 'English', duration: 107,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BOTA5NDZlZGUtMjAxOS00YTRkLTkwYmMtYWQ0NWEwZDZiNjEzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_FMjpg_UX400_.jpg',
        rating: 8.5, cast: 'Miles Teller, J.K. Simmons, Melissa Benoist', director: 'Damien Chazelle', producer: 'Jason Blum',
        releaseDate: new Date(Date.now() - 50 * 864e5).toISOString().split('T')[0]
      },
      {
        title: '3 Idiots',
        description: 'Two friends search for their long-lost companion. They revisit their college days and recall memories of their friend who inspired them to think differently.',
        genre: 'Comedy', language: 'Hindi', duration: 170,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BNTkyOGVjMGEtNmQzZi00NzFlLTlhOWQtODYyMDc2ZGJmYzFhXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_FMjpg_UX400_.jpg',
        rating: 8.4, cast: 'Aamir Khan, R. Madhavan, Sharman Joshi', director: 'Rajkumar Hirani', producer: 'Vidhu Vinod Chopra',
        releaseDate: new Date(Date.now() - 55 * 864e5).toISOString().split('T')[0]
      },
      {
        title: 'Barbie',
        description: 'Barbie and Ken go to the real world and soon discover the joys and perils of living among humans.',
        genre: 'Comedy', language: 'English', duration: 114,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BNjU3N2QxNzYtMjk1NC00MTc4LTk1NTQtMmUxNTljM2I0NDA5XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_FMjpg_UX400_.jpg',
        rating: 6.9, cast: 'Margot Robbie, Ryan Gosling, America Ferrera', director: 'Greta Gerwig', producer: 'David Heyman',
        releaseDate: new Date(Date.now() - 12 * 864e5).toISOString().split('T')[0]
      },
      {
        title: 'Top Gun: Maverick',
        description: 'After more than thirty years, Pete Mitchell is still at the top of his game but must confront the ghosts of his past.',
        genre: 'Action', language: 'English', duration: 130,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BZWYzOGEwNTgtNWU3NS00ZTQ0LWJkODUtMmVhMjIwMjA1ZmQwXkEyXkFqcGdeQXVyMjkwOTAyMDU@._V1_FMjpg_UX400_.jpg',
        rating: 8.2, cast: 'Tom Cruise, Jennifer Connelly, Miles Teller', director: 'Joseph Kosinski', producer: 'Jerry Bruckheimer',
        releaseDate: new Date(Date.now() - 18 * 864e5).toISOString().split('T')[0]
      },
      // UPCOMING
      {
        title: 'The Grand Budapest Hotel',
        description: 'A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy.',
        genre: 'Comedy', language: 'English', duration: 99,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BMzM5NjUxOTEyMl5BMl5BanBnXkFtZTgwNjEyMDM0MDE@._V1_FMjpg_UX400_.jpg',
        rating: 0, cast: 'Ralph Fiennes, F. Murray Abraham, Mathieu Amalric', director: 'Wes Anderson', producer: 'Scott Rudin',
        releaseDate: new Date(Date.now() + 10 * 864e5).toISOString().split('T')[0]
      },
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
        genre: 'Sci-Fi', language: 'English', duration: 166,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BN2QyZGU4ZDctOWMzMy00NTc5LThlOGQtODhmNDI1NmY5YzAwXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_FMjpg_UX400_.jpg',
        rating: 0, cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson', director: 'Denis Villeneuve', producer: 'Mary Parent',
        releaseDate: new Date(Date.now() + 20 * 864e5).toISOString().split('T')[0]
      },

      {
        title: 'Avatar 3',
        description: 'Jake Sully and Neytiri face a new threat that could shatter their family and the balance of all of Pandora.',
        genre: 'Sci-Fi', language: 'English', duration: 200,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BYjhiNjBlODctY2ZiOC00YjVlLWFlNzAtNTVhNzM1YjI1NzMxXkEyXkFqcGdeQXVyMjQxNTE1MDA@._V1_FMjpg_UX400_.jpg',
        rating: 0, cast: 'Sam Worthington, Zoe Saldana, Sigourney Weaver', director: 'James Cameron', producer: 'Jon Landau',
        releaseDate: new Date(Date.now() + 60 * 864e5).toISOString().split('T')[0]
      },

    ];

    const movies = await Movie.bulkCreate(moviesData);

    const indianCities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 
      'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'
    ];

    const createdTheatres = [];
    for (const city of indianCities) {
      const theatresForCity = [
        { name: `PVR Cinemas ${city}`, city, address: `High Street Mall, ${city}`, capacity: 200 },
        { name: `INOX ${city}`, city, address: `City Center, ${city}`, capacity: 150 },
        { name: `Cinepolis ${city}`, city, address: `Grand Plaza, ${city}`, capacity: 250 }
      ];
      const theatres = await Theatre.bulkCreate(theatresForCity);
      createdTheatres.push(...theatres);
    }

    const showsData = [];
    const showTimes = ['10:00', '13:30', '17:00', '20:30'];

    const nowShowingMovies = movies.filter(m => new Date(m.releaseDate) <= new Date());

    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);
      const dateStr = targetDate.toISOString().split('T')[0];

      for (const theatre of createdTheatres) {
        for (let i = 0; i < 3; i++) { 
          const randomMovie = nowShowingMovies[Math.floor(Math.random() * nowShowingMovies.length)];
          showsData.push({
            movieId: randomMovie.id,
            theatreId: theatre.id,
            showDate: dateStr,
            showTime: showTimes[i],
            price: Math.floor(Math.random() * 100) + 150 
          });
        }
      }
    }

    const createdShows = await Show.bulkCreate(showsData);
    console.log(`Created ${createdShows.length} shows.`);

    const allSeats = [];
    for (const show of createdShows) {
      const rows = ['A', 'B', 'C', 'D', 'E'];
      for (const row of rows) {
        for (let col = 1; col <= 20; col++) {
          allSeats.push({
            showId: show.id,
            seatNumber: `${row}${col}`,
            row,
            status: 'AVAILABLE',
            priceType: row === 'E' ? 'PREMIUM' : 'STANDARD'
          });
        }
      }
    }

    const batchSize = 10000;
    for (let i = 0; i < allSeats.length; i += batchSize) {
      await Seat.bulkCreate(allSeats.slice(i, i + batchSize));
      console.log(`Inserted seat batch ${i / batchSize + 1}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

run();

