import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Seat = sequelize.define(
  'Seat',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    showId:     { type: DataTypes.UUID,   allowNull: false },
    seatNumber: { type: DataTypes.STRING, allowNull: false },  // e.g. "A1", "B5"
    row:        { type: DataTypes.STRING, allowNull: false },  // e.g. "A", "B"
    // AVAILABLE → LOCKED (Redis) → BOOKED
    status: {
      type: DataTypes.ENUM('AVAILABLE', 'LOCKED', 'BOOKED'),
      defaultValue: 'AVAILABLE',
    },
  },
  { tableName: 'seats', timestamps: true }
);

export default Seat;
