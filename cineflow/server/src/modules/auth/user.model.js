import bcrypt from 'bcryptjs';
import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

/**
 * User Model (Sequelize / PostgreSQL)
 *
 * Interview talking points:
 * - role is embedded in JWT at login time for performance.
 * - passwordHash is excluded by default in scopes and custom toJSON.
 * - email uniqueness is enforced at the DB level (UNIQUE constraint).
 */
const User = sequelize.define(
  'User',
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.VIRTUAL,
    },
    role: {
      type: DataTypes.ENUM('USER', 'ADMIN', 'THEATRE_MANAGER'),
      defaultValue: 'USER',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: 'users',
    defaultScope: {
      attributes: { exclude: ['passwordHash'] },
    },
    scopes: {
      withPassword: {
        attributes: {},
      },
    },
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.passwordHash = await bcrypt.hash(user.password, 10);
          delete user.password;
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.passwordHash = await bcrypt.hash(user.password, 10);
          delete user.password;
        }
      },
    },
  }
);

// Add custom toJSON method to match MongoDB behavior where we remove passwordHash
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.passwordHash;
  return values;
};

export default User;
