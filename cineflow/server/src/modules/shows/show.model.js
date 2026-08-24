import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Show = sequelize.define(
  'Show',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    movieId:   { type: DataTypes.UUID,           allowNull: false },
    theatreId: { type: DataTypes.UUID,           allowNull: false },
    showDate:  { type: DataTypes.DATEONLY,        allowNull: false },  // e.g. "2024-08-15"
    showTime:  { type: DataTypes.TIME,            allowNull: false },  // e.g. "14:30:00"
    price:     { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    totalSeats:{ type: DataTypes.INTEGER,         defaultValue: 50 },
  },
  { tableName: 'shows', timestamps: true }
);

export default Show;
