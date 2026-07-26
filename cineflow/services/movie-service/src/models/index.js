/**
 * models/index.js — Sets up all model associations for the movie service.
 *
 * Associations (the "relationships"):
 *   Movie    hasMany  Shows   (one movie can have many shows)
 *   Theatre  hasMany  Shows   (one theatre can have many shows)
 *   Show     hasMany  Seats   (one show has many seats)
 *
 * Why define associations here?
 *   Keeps each model file clean. Only this file knows about cross-model relationships.
 */

import sequelize from '../config/db.js';
import Movie from './movie.model.js';
import Theatre from './theatre.model.js';
import Show from './show.model.js';
import Seat from './seat.model.js';

// Movie ↔ Show
Movie.hasMany(Show, { foreignKey: 'movieId', as: 'shows' });
Show.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

// Theatre ↔ Show
Theatre.hasMany(Show, { foreignKey: 'theatreId', as: 'shows' });
Show.belongsTo(Theatre, { foreignKey: 'theatreId', as: 'theatre' });

// Show ↔ Seat
Show.hasMany(Seat, { foreignKey: 'showId', as: 'seats' });
Seat.belongsTo(Show, { foreignKey: 'showId', as: 'show' });

export { sequelize, Movie, Theatre, Show, Seat };
