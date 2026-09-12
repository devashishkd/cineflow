import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Model (Mongoose / MongoDB)
 *
 * - role is embedded in JWT at login time for performance.
 * - passwordHash is excluded by default via select: false.
 * - email uniqueness is enforced at the DB level (unique index).
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // excluded by default; use .select('+passwordHash') to include
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN', 'THEATRE_MANAGER'],
      default: 'USER',
    },
    phone: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// Pre-save hook: hash password before persisting
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  // If a plain password was set directly on passwordHash field, hash it
  if (this.passwordHash && !this.passwordHash.startsWith('$2')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
});

const User = mongoose.model('User', userSchema);

export default User;
