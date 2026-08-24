import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Payment = sequelize.define(
  'Payment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bookingId:     { type: DataTypes.UUID,          allowNull: false },
    userId:        { type: DataTypes.UUID,          allowNull: false },
    amount:        { type: DataTypes.DECIMAL(10, 2),allowNull: false },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'),
      defaultValue: 'PENDING',
    },
    transactionId: { type: DataTypes.STRING, allowNull: true },
    failureReason: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: 'payments', timestamps: true }
);

export default Payment;
