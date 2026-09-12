import mongoose from 'mongoose';
import Booking from '../bookings/booking.model.js';
import Movie from '../movies/movie.model.js';
import Theatre from '../theatres/theatre.model.js';
import Show from '../shows/show.model.js';

/**
 * Admin Dashboard Service
 *
 * All analytics computed via MongoDB Aggregation Pipelines.
 *
 * Interview: Why aggregation pipelines?
 * MongoDB aggregation is the equivalent of SQL GROUP BY + JOINs.
 * Complex reporting (conditional sums, lookups, date grouping) are
 * expressed as pipeline stages ($match, $group, $lookup, $project).
 * Computation happens in the DB — saves network bandwidth and Node.js memory.
 */

export const getSummaryStats = async () => {
  const [bookingStats] = await Booking.aggregate([
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: {
          $sum: {
            $cond: [{ $eq: ['$status', 'CONFIRMED'] }, '$totalAmount', 0],
          },
        },
        ticketsSold: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'CONFIRMED'] },
              { $size: '$seatNumbers' },
              0,
            ],
          },
        },
        cancelledCount: {
          $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] },
        },
        failedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'PAYMENT_FAILED'] }, 1, 0] },
        },
        confirmedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'CONFIRMED'] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalBookings: 1,
        total_bookings: '$totalBookings',
        totalRevenue: 1,
        total_revenue: '$totalRevenue',
        ticketsSold: 1,
        total_tickets_sold: '$ticketsSold',
        cancelledCount: 1,
        failedCount: 1,
        confirmedCount: 1,
      },
    },
  ]);

  const [totalShows, totalMovies, totalTheatres] = await Promise.all([
    Show.countDocuments(),
    Movie.countDocuments(),
    Theatre.countDocuments(),
  ]);

  return {
    ...(bookingStats || {
      totalBookings: 0, total_bookings: 0,
      totalRevenue: 0,  total_revenue: 0,
      ticketsSold: 0,   total_tickets_sold: 0,
      cancelledCount: 0, failedCount: 0, confirmedCount: 0,
    }),
    occupancy_rate: 0,
    totalShows,
    totalMovies,
    totalTheatres,
  };
};

export const getPopularMovies = async (limit = 10) => {
  const results = await Booking.aggregate([
    { $match: { status: 'CONFIRMED' } },
    {
      $lookup: {
        from: 'shows',
        localField: 'showId',
        foreignField: '_id',
        as: 'show',
      },
    },
    { $unwind: '$show' },
    {
      $lookup: {
        from: 'movies',
        localField: 'show.movieId',
        foreignField: '_id',
        as: 'movie',
      },
    },
    { $unwind: '$movie' },
    {
      $group: {
        _id: '$movie._id',
        title:    { $first: '$movie.title' },
        poster:   { $first: '$movie.posterUrl' },
        genre:    { $first: '$movie.genre' },
        bookings: { $sum: 1 },
        revenue:  { $sum: '$totalAmount' },
        tickets:  { $sum: { $size: '$seatNumbers' } },
      },
    },
    { $sort: { bookings: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        id: '$_id',
        title: 1,
        poster: 1,
        genre: 1,
        bookings: 1,
        revenue: 1,
        tickets: 1,
        tickets_sold: '$tickets',
      },
    },
  ]);
  return results;
};

export const getPopularTheatres = async (limit = 10) => {
  const results = await Booking.aggregate([
    { $match: { status: 'CONFIRMED' } },
    {
      $lookup: {
        from: 'shows',
        localField: 'showId',
        foreignField: '_id',
        as: 'show',
      },
    },
    { $unwind: '$show' },
    {
      $lookup: {
        from: 'theatres',
        localField: 'show.theatreId',
        foreignField: '_id',
        as: 'theatre',
      },
    },
    { $unwind: '$theatre' },
    {
      $group: {
        _id: '$theatre._id',
        name:     { $first: '$theatre.name' },
        city:     { $first: '$theatre.city' },
        bookings: { $sum: 1 },
        revenue:  { $sum: '$totalAmount' },
        tickets:  { $sum: { $size: '$seatNumbers' } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        id: '$_id',
        name: 1,
        city: 1,
        bookings: 1,
        revenue: 1,
        tickets: 1,
        tickets_sold: '$tickets',
      },
    },
  ]);
  return results;
};

export const getDailyRevenue = async (days = 30) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const results = await Booking.aggregate([
    { $match: { status: 'CONFIRMED', createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        revenue:  { $sum: '$totalAmount' },
        bookings: { $sum: 1 },
        tickets:  { $sum: { $size: '$seatNumbers' } },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        revenue: 1,
        bookings: 1,
        tickets: 1,
      },
    },
  ]);
  return results;
};

export const getBookingStatusBreakdown = async () => {
  const results = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1,
      },
    },
  ]);
  return results;
};

export default { getSummaryStats, getPopularMovies, getPopularTheatres, getDailyRevenue, getBookingStatusBreakdown };
