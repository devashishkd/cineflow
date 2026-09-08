import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Movie = sequelize.define(
  'Movie',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: { type: DataTypes.TEXT },
    genre:       { type: DataTypes.STRING },
    language:    { type: DataTypes.STRING, defaultValue: 'English' },
    releaseDate: { type: DataTypes.DATEONLY }, // YYYY-MM-DD
    cast:        { type: DataTypes.TEXT },
    director:    { type: DataTypes.STRING },
    producer:    { type: DataTypes.STRING },
    duration:    { type: DataTypes.INTEGER }, // minutes
    posterUrl:   { type: DataTypes.STRING },
    rating:      { type: DataTypes.FLOAT, defaultValue: 0 },
  },
  {
    timestamps: true,
    tableName: 'movies',
  }
);

export default Movie;
