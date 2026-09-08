import sequelize from '../../config/db.js';
import Movie from '../movies/movie.model.js';
import Theatre from '../theatres/theatre.model.js';
import Show from '../shows/show.model.js';

/**
 * Admin Dashboard Service
 *
 * All analytics computed via PostgreSQL raw queries with aggregations.
 *
 * Interview: Why raw SQL aggregations?
 * While Sequelize provides ORM grouping, complex reporting queries involving 
 * conditional sums (CASE WHEN), array lengths, and multiple joins are often 
 * cleaner and more optimized when written in raw SQL. Moving computation to 
 * the DB saves network bandwidth and memory in Node.js.
 */

export const getSummaryStats = async () => {
  const [[bookingStats]] = await sequelize.query(`
    SELECT
      COUNT(*)::int AS "totalBookings",
      COUNT(*)::int AS "total_bookings",
      COALESCE(SUM(CASE WHEN status = 'CONFIRMED' THEN "totalAmount" ELSE 0 END), 0) AS "totalRevenue",
      COALESCE(SUM(CASE WHEN status = 'CONFIRMED' THEN "totalAmount" ELSE 0 END), 0) AS "total_revenue",
      COALESCE(SUM(CASE WHEN status = 'CONFIRMED' THEN array_length("seatNumbers", 1) ELSE 0 END), 0)::int AS "ticketsSold",
      COALESCE(SUM(CASE WHEN status = 'CONFIRMED' THEN array_length("seatNumbers", 1) ELSE 0 END), 0)::int AS "total_tickets_sold",
      SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END)::int AS "cancelledCount",
      SUM(CASE WHEN status = 'PAYMENT_FAILED' THEN 1 ELSE 0 END)::int AS "failedCount",
      SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END)::int AS "confirmedCount"
    FROM bookings
  `);

  const totalShows = await Show.count();
  const totalMovies = await Movie.count();
  const totalTheatres = await Theatre.count();

  return {
    ...bookingStats,
    occupancy_rate: 0,
    totalShows,
    totalMovies,
    totalTheatres,
  };
};

export const getPopularMovies = async (limit = 10) => {
  const [results] = await sequelize.query(`
    SELECT 
      m.id AS "_id", 
      m.id,
      m.title, 
      m."posterUrl" AS poster, 
      m.genre, 
      COUNT(b.id)::int AS bookings, 
      COALESCE(SUM(b."totalAmount"), 0) AS revenue, 
      COALESCE(SUM(array_length(b."seatNumbers", 1)), 0)::int AS tickets,
      COALESCE(SUM(array_length(b."seatNumbers", 1)), 0)::int AS tickets_sold
    FROM bookings b
    JOIN shows s ON b."showId" = s.id
    JOIN movies m ON s."movieId" = m.id
    WHERE b.status = 'CONFIRMED'
    GROUP BY m.id, m.title, m."posterUrl", m.genre
    ORDER BY bookings DESC
    LIMIT :limit
  `, { replacements: { limit } });
  return results;
};

export const getPopularTheatres = async (limit = 10) => {
  const [results] = await sequelize.query(`
    SELECT 
      t.id,
      t.name, 
      t.city, 
      COUNT(b.id)::int AS bookings, 
      COALESCE(SUM(b."totalAmount"), 0) AS revenue, 
      COALESCE(SUM(array_length(b."seatNumbers", 1)), 0)::int AS tickets,
      COALESCE(SUM(array_length(b."seatNumbers", 1)), 0)::int AS tickets_sold
    FROM bookings b
    JOIN shows s ON b."showId" = s.id
    JOIN theatres t ON s."theatreId" = t.id
    WHERE b.status = 'CONFIRMED'
    GROUP BY t.id, t.name, t.city
    ORDER BY revenue DESC
    LIMIT :limit
  `, { replacements: { limit } });
  return results;
};

export const getDailyRevenue = async (days = 30) => {
  const [results] = await sequelize.query(`
    SELECT 
      TO_CHAR(b."createdAt", 'YYYY-MM-DD') AS date, 
      COALESCE(SUM(b."totalAmount"), 0) AS revenue, 
      COUNT(b.id)::int AS bookings, 
      COALESCE(SUM(array_length(b."seatNumbers", 1)), 0)::int AS tickets
    FROM bookings b
    WHERE b.status = 'CONFIRMED' AND b."createdAt" >= NOW() - (:days * INTERVAL '1 day')
    GROUP BY TO_CHAR(b."createdAt", 'YYYY-MM-DD')
    ORDER BY date ASC
  `, { replacements: { days } });
  return results;
};

export const getBookingStatusBreakdown = async () => {
  const [results] = await sequelize.query(`
    SELECT status, COUNT(id)::int AS count
    FROM bookings
    GROUP BY status
    ORDER BY count DESC
  `);
  return results;
};

export default { getSummaryStats, getPopularMovies, getPopularTheatres, getDailyRevenue, getBookingStatusBreakdown };
