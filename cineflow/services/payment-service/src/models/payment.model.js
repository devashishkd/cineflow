import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

/**
 * Payment model — records the outcome of each payment attempt.
 *
 * Status flow:
 *   PENDING → COMPLETED (mock success)
 *   PENDING → FAILED    (mock failure)
 */
const Payment = sequelize.define(
  'Payment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bookingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'),
      defaultValue: 'PENDING',
    },
    // Simulated transaction reference
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    failureReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'payments',
    timestamps: true,
  }
);

export default Payment;
