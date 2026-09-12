import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
    },
    seatNumber: {
      type: String,
      required: true,
    },
    row: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'LOCKED', 'BOOKED'],
      default: 'AVAILABLE',
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
        return ret;
      },
    },
  }
);

// Compound unique index: one seat number per show
seatSchema.index({ showId: 1, seatNumber: 1 }, { unique: true });

const Seat = mongoose.model('Seat', seatSchema);

export default Seat;
