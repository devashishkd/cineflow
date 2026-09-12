import 'dotenv/config';
import sequelize from '../src/config/db.js';
import Movie from '../src/modules/movies/movie.model.js';
import Show from '../src/modules/shows/show.model.js';
import Theatre from '../src/modules/theatres/theatre.model.js';

async function check() {
  const spidey = await Movie.findOne({ where: { title: 'Spider Man : Brand New Day' } });
  console.log('Spidey movie:', spidey?.id, spidey?.title);
  if (spidey) {
    const shows = await Show.findAll({
      where: { movieId: spidey.id },
      include: [{ model: Theatre, as: 'theatre' }]
    });
    console.log('Spidey shows count:', shows.length);
    console.log('Spidey shows:', shows.map(s => ({ date: s.showDate, time: s.showTime, theatre: s.theatre?.name, city: s.theatre?.city })));
  }
  process.exit(0);
}
check();
