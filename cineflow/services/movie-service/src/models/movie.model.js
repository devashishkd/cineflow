import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

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
    },
    description: {
      type: DataTypes.TEXT,
    },
    genre: {
      type: DataTypes.STRING,
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'English',
    },
    releaseDate: {
      type: DataTypes.DATEONLY,
    },
    cast: {
      type: DataTypes.STRING,
    },
    director: {
      type: DataTypes.STRING,
    },
    producer: {
      type: DataTypes.STRING,
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
    },
    posterUrl: {
      type: DataTypes.STRING,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    tableName: 'movies',
    timestamps: true,
  }
);

export default Movie;
