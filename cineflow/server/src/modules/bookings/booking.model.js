import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import User from '../auth/user.model.js';
import Show from '../shows/show.model.js';

export const BOOKING_STATUS = {
  PENDING:            'PENDING',
  PAYMENT_INITIATED:  'PAYMENT_INITIATED',
  PAYMENT_SUCCESS:    'PAYMENT_SUCCESS',
  CONFIRMED:          'CONFIRMED',
  PAYMENT_FAILED:     'PAYMENT_FAILED',
  EXPIRED:            'EXPIRED',
  CANCELLED:          'CANCELLED',
};

export const VALID_TRANSITIONS = {
  [BOOKING_STATUS.PENDING]:           [BOOKING_STATUS.PAYMENT_INITIATED, BOOKING_STATUS.EXPIRED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.PAYMENT_INITIATED]: [BOOKING_STATUS.PAYMENT_SUCCESS, BOOKING_STATUS.PAYMENT_FAILED],
  [BOOKING_STATUS.PAYMENT_SUCCESS]:   [BOOKING_STATUS.CONFIRMED],
  [BOOKING_STATUS.PAYMENT_FAILED]:    [BOOKING_STATUS.PENDING],
  [BOOKING_STATUS.CONFIRMED]:         [BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.EXPIRED]:           [],
  [BOOKING_STATUS.CANCELLED]:         [],
};

const Booking = sequelize.define(
  'Booking',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: 'id' },
    },
    showId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Show, key: 'id' },
    },
    // PostgreSQL array for simple one-to-many embedding without a junction table
    seatIds: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
    },
    seatNumbers: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(Object.values(BOOKING_STATUS)),
      defaultValue: BOOKING_STATUS.PENDING,
      allowNull: false,
    },
    idempotencyKey: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancellationReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: 'bookings',
  }
);

Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });

Booking.belongsTo(Show, { foreignKey: 'showId', as: 'show' });
Show.hasMany(Booking, { foreignKey: 'showId', as: 'bookings' });

export default Booking;
