import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
    },
    showDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    showTime: {
      type: String, // HH:MM
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalSeats: {
      type: Number,
      default: 50,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        if (ret.theatreId && typeof ret.theatreId === 'object') {
          ret.theatre = ret.theatreId;
        }
        if (ret.movieId && typeof ret.movieId === 'object') {
          ret.movie = ret.movieId;
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Show = mongoose.model('Show', showSchema);

export default Show;
