import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

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
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
    },
    totalScreens: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    tableName: 'theatres',
    timestamps: true,
  }
);

export default Theatre;
