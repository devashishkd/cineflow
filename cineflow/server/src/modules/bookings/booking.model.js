import mongoose from 'mongoose';

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
  [BOOKING_STATUS.PAYMENT_INITIATED]: [BOOKING_STATUS.PAYMENT_SUCCESS, BOOKING_STATUS.PAYMENT_FAILED, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.EXPIRED],
  [BOOKING_STATUS.PAYMENT_SUCCESS]:   [BOOKING_STATUS.CONFIRMED],
  [BOOKING_STATUS.PAYMENT_FAILED]:    [BOOKING_STATUS.PENDING, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.EXPIRED],
  [BOOKING_STATUS.CONFIRMED]:         [BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.EXPIRED]:           [],
  [BOOKING_STATUS.CANCELLED]:         [],
};

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
    },
    // Native MongoDB arrays — replaces PostgreSQL ARRAY(UUID) / ARRAY(STRING)
    seatIds: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
    },
    seatNumbers: {
      type: [String],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
      required: true,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
    },
    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, default: null },
    expiresAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
