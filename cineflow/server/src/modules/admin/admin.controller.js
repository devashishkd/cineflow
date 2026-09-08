import adminService from './admin.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * GET /api/admin/dashboard
 * Returns all dashboard stats in one response.
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const [summary, popularMovies, popularTheatres, dailyRevenue, statusBreakdown] = await Promise.all([
    adminService.getSummaryStats(),
    adminService.getPopularMovies(10),
    adminService.getPopularTheatres(10),
    adminService.getDailyRevenue(30),
    adminService.getBookingStatusBreakdown(),
  ]);

  res.json({
    success: true,
    data: { summary, popularMovies, popularTheatres, dailyRevenue, statusBreakdown },
  });
});

export const getSummary       = asyncHandler(async (req, res) => res.json({ success: true, data: await adminService.getSummaryStats() }));
export const getPopularMovies = asyncHandler(async (req, res) => res.json({ success: true, data: await adminService.getPopularMovies(parseInt(req.query.limit) || 10) }));
export const getPopularTheatres = asyncHandler(async (req, res) => res.json({ success: true, data: await adminService.getPopularTheatres(parseInt(req.query.limit) || 10) }));
export const getDailyRevenue  = asyncHandler(async (req, res) => res.json({ success: true, data: await adminService.getDailyRevenue(parseInt(req.query.days) || 30) }));
export const getStatusBreakdown = asyncHandler(async (req, res) => res.json({ success: true, data: await adminService.getBookingStatusBreakdown() }));

export default { getDashboard, getSummary, getPopularMovies, getPopularTheatres, getDailyRevenue, getStatusBreakdown };
