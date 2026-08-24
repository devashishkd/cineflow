import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Booking = sequelize.define(
  'Booking',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId:      { type: DataTypes.UUID,                   allowNull: false },
    showId:      { type: DataTypes.UUID,                   allowNull: false },
    seatIds:     { type: DataTypes.ARRAY(DataTypes.UUID),  allowNull: false },
    seatNumbers: { type: DataTypes.ARRAY(DataTypes.STRING),allowNull: false },
    totalAmount: { type: DataTypes.DECIMAL(10, 2),         allowNull: false },
    status: {
      type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED'),
      defaultValue: 'PENDING',
    },
  },
  { tableName: 'bookings', timestamps: true }
);

export default Booking;
