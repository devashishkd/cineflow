import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: { type: String },
    genre:       { type: String },
    language:    { type: String, default: 'English' },
    releaseDate: { type: String }, // YYYY-MM-DD string (kept compatible with existing data)
    cast:        { type: String },
    director:    { type: String },
    producer:    { type: String },
    duration:    { type: Number }, // minutes
    posterUrl:   { type: String },
    rating:      { type: Number, default: 0 },
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

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
