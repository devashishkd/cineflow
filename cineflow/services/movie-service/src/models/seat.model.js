import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Seat = sequelize.define(
  'Seat',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    showId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    seatNumber: {
      type: DataTypes.STRING, // e.g. "A1", "B5", "E10"
      allowNull: false,
    },
    row: {
      type: DataTypes.STRING, // e.g. "A", "B", "C"
      allowNull: false,
    },
    // AVAILABLE → LOCKED (Phase 2 Redis) → BOOKED
    // In Phase 1: AVAILABLE → BOOKED directly
    status: {
      type: DataTypes.ENUM('AVAILABLE', 'LOCKED', 'BOOKED'),
      defaultValue: 'AVAILABLE',
    },
  },
  {
    tableName: 'seats',
    timestamps: true,
  }
);

export default Seat;
