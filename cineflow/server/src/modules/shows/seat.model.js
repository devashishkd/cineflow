import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import Show from './show.model.js';

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
      references: {
        model: Show,
        key: 'id',
      },
    },
    seatNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    row: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('AVAILABLE', 'LOCKED', 'BOOKED'),
      defaultValue: 'AVAILABLE',
    },
  },
  {
    timestamps: true,
    tableName: 'seats',
    indexes: [
      {
        unique: true,
        fields: ['showId', 'seatNumber'],
      },
    ],
  }
);

// Associations
Seat.belongsTo(Show, { foreignKey: 'showId', as: 'show' });
Show.hasMany(Seat, { foreignKey: 'showId', as: 'seats' });

export default Seat;
