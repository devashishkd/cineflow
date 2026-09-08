import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Theatre = sequelize.define(
  'Theatre',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    address: { type: DataTypes.TEXT },
    totalScreens: { type: DataTypes.INTEGER, defaultValue: 1 },
  },
  {
    timestamps: true,
    tableName: 'theatres',
  }
);

export default Theatre;
