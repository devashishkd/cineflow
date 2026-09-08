import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import Movie from '../movies/movie.model.js';
import Theatre from '../theatres/theatre.model.js';

const Show = sequelize.define(
  'Show',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    movieId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Movie,
        key: 'id',
      },
    },
    theatreId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Theatre,
        key: 'id',
      },
    },
    showDate: {
      type: DataTypes.DATEONLY, // YYYY-MM-DD
      allowNull: false,
    },
    showTime: {
      type: DataTypes.TIME, // HH:MM:SS
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalSeats: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
    },
  },
  {
    timestamps: true,
    tableName: 'shows',
  }
);

// Define associations
Show.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });
Movie.hasMany(Show, { foreignKey: 'movieId', as: 'shows' });

Show.belongsTo(Theatre, { foreignKey: 'theatreId', as: 'theatre' });
Theatre.hasMany(Show, { foreignKey: 'theatreId', as: 'shows' });

export default Show;
