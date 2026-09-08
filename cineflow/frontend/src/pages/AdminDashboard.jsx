import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, TrendingUp, Users, Film, Ticket, Building2,
  CheckCircle2, Plus, Edit2, Trash2, X, Search, Calendar,
  Clock, DollarSign, AlertCircle, RefreshCw, Layers
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'analytics' | 'movies' | 'theatres' | 'shows' | 'bookings'
  const [activeTab, setActiveTab] = useState('analytics');

  // Analytics Data
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Movies Data & State
  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [movieForm, setMovieForm] = useState({
    title: '', description: '', genre: '', language: 'English',
    duration: 120, releaseDate: '', rating: 8.0, posterUrl: '',
    cast: '', director: '', producer: ''
  });

  // Theatres Data & State
  const [theatres, setTheatres] = useState([]);
  const [loadingTheatres, setLoadingTheatres] = useState(false);
  const [theatreModalOpen, setTheatreModalOpen] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const [theatreForm, setTheatreForm] = useState({ name: '', city: '', address: '' });

  // Shows Data & State
  const [shows, setShows] = useState([]);
  const [loadingShows, setLoadingShows] = useState(false);
  const [showModalOpen, setShowModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const [showForm, setShowForm] = useState({
    movieId: '', theatreId: '', showDate: '', showTime: '18:00', price: 250
  });

  // Bookings Data & State
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingFilterStatus, setBookingFilterStatus] = useState('');

  // Status message
  const [actionMessage, setActionMessage] = useState(null);

  const showNotification = (msg, isError = false) => {
    setActionMessage({ text: msg, isError });
    setTimeout(() => setActionMessage(null), 4000);
  };

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'THEATRE_MANAGER') {
      navigate('/');
      return;
    }
    fetchDashboard();
    fetchMovies();
    fetchTheatres();
    fetchShows();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'movies') fetchMovies();
    if (activeTab === 'theatres') fetchTheatres();
    if (activeTab === 'shows') {
      fetchShows();
      fetchMovies();
      fetchTheatres();
    }
    if (activeTab === 'bookings') fetchBookings();
  }, [activeTab]);

  // ── Fetchers ─────────────────────────────────────────────────────────────
  const fetchDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const res = await api.get('/admin/dashboard');
      setDashboardData(res.data.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      showNotification('Failed to load dashboard analytics.', true);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchMovies = async () => {
    setLoadingMovies(true);
    try {
      const res = await api.get('/movies?limit=100');
      setMovies(res.data.data || []);
    } catch (err) {
      console.error(err);
      showNotification('Failed to fetch movies.', true);
    } finally {
      setLoadingMovies(false);
    }
  };

  const fetchTheatres = async () => {
    setLoadingTheatres(true);
    try {
      const res = await api.get('/theatres');
      setTheatres(res.data.data || []);
    } catch (err) {
      console.error(err);
      showNotification('Failed to fetch theatres.', true);
    } finally {
      setLoadingTheatres(false);
    }
  };

  const fetchShows = async () => {
    setLoadingShows(true);
    try {
      const res = await api.get('/shows');
      setShows(res.data.data || []);
    } catch (err) {
      console.error(err);
      showNotification('Failed to fetch shows.', true);
    } finally {
      setLoadingShows(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const query = bookingFilterStatus ? `?status=${bookingFilterStatus}` : '';
      const res = await api.get(`/bookings/all${query}`);
      setBookings(res.data.data || []);
    } catch (err) {
      console.error(err);
      showNotification('Failed to fetch bookings.', true);
    } finally {
      setLoadingBookings(false);
    }
  };

  // ── Movie Handlers ───────────────────────────────────────────────────────
  const openMovieCreate = () => {
    setEditingMovie(null);
    setMovieForm({
      title: '', description: '', genre: 'Action', language: 'English',
      duration: 120, releaseDate: new Date().toISOString().split('T')[0],
      rating: 8.0, posterUrl: '', cast: '', director: '', producer: ''
    });
    setMovieModalOpen(true);
  };

  const openMovieEdit = (movie) => {
    setEditingMovie(movie);
    setMovieForm({
      title: movie.title || '',
      description: movie.description || '',
      genre: movie.genre || '',
      language: movie.language || 'English',
      duration: movie.duration || 120,
      releaseDate: movie.releaseDate || '',
      rating: movie.rating || 0,
      posterUrl: movie.posterUrl || '',
      cast: movie.cast || '',
      director: movie.director || '',
      producer: movie.producer || ''
    });
    setMovieModalOpen(true);
  };

  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMovie) {
        await api.put(`/movies/${editingMovie.id}`, movieForm);
        showNotification('Movie updated successfully.');
      } else {
        await api.post('/movies', movieForm);
        showNotification('Movie created successfully.');
      }
      setMovieModalOpen(false);
      await fetchMovies();
      await fetchDashboard();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to save movie.', true);
    }
  };

  const handleMovieDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      await api.delete(`/movies/${id}`);
      showNotification('Movie deleted.');
      fetchMovies();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete movie.', true);
    }
  };

  // ── Theatre Handlers ─────────────────────────────────────────────────────
  const openTheatreCreate = () => {
    setEditingTheatre(null);
    setTheatreForm({ name: '', city: 'Mumbai', address: '' });
    setTheatreModalOpen(true);
  };

  const openTheatreEdit = (theatre) => {
    setEditingTheatre(theatre);
    setTheatreForm({
      name: theatre.name || '',
      city: theatre.city || '',
      address: theatre.address || ''
    });
    setTheatreModalOpen(true);
  };

  const handleTheatreSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTheatre) {
        await api.put(`/theatres/${editingTheatre.id}`, theatreForm);
        showNotification('Theatre updated successfully.');
      } else {
        await api.post('/theatres', theatreForm);
        showNotification('Theatre created successfully.');
      }
      setTheatreModalOpen(false);
      await fetchTheatres();
      await fetchDashboard();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to save theatre.', true);
    }
  };

  const handleTheatreDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this theatre?')) return;
    try {
      await api.delete(`/theatres/${id}`);
      showNotification('Theatre deleted.');
      fetchTheatres();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete theatre.', true);
    }
  };

  // ── Show Handlers ────────────────────────────────────────────────────────
  const openShowCreate = async () => {
    setEditingShow(null);
    let currentMovies = movies;
    let currentTheatres = theatres;
    if (!currentMovies || currentMovies.length === 0) {
      try {
        const res = await api.get('/movies?limit=100');
        currentMovies = res.data.data || [];
        setMovies(currentMovies);
      } catch (e) {}
    }
    if (!currentTheatres || currentTheatres.length === 0) {
      try {
        const res = await api.get('/theatres');
        currentTheatres = res.data.data || [];
        setTheatres(currentTheatres);
      } catch (e) {}
    }
    setShowForm({
      movieId: currentMovies[0]?.id || '',
      theatreId: currentTheatres[0]?.id || '',
      showDate: new Date().toISOString().split('T')[0],
      showTime: '18:00',
      price: 250
    });
    setShowModalOpen(true);
  };

  const openShowEdit = (show) => {
    setEditingShow(show);
    setShowForm({
      movieId: show.movieId || '',
      theatreId: show.theatreId || '',
      showDate: show.showDate || '',
      showTime: show.showTime || '18:00',
      price: show.price || 250
    });
    setShowModalOpen(true);
  };

  const handleShowSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingShow) {
        await api.put(`/shows/${editingShow.id}`, showForm);
        showNotification('Show updated successfully.');
      } else {
        await api.post('/shows', showForm);
        showNotification('Show created successfully with 50 seats generated.');
      }
      setShowModalOpen(false);
      fetchShows();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to save show.', true);
    }
  };

  const handleShowDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this show?')) return;
    try {
      await api.delete(`/shows/${id}`);
      showNotification('Show deleted.');
      fetchShows();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete show.', true);
    }
  };

  // ── Booking Handlers ─────────────────────────────────────────────────────
  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking and release seats?')) return;
    try {
      await api.post(`/bookings/${id}/cancel`, { reason: 'Admin cancelled' });
      showNotification('Booking cancelled and seats released.');
      fetchBookings();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to cancel booking.', true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full bg-zinc-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5 text-white tracking-tight">
            <Layers className="text-zinc-400 w-6 h-6" />
            Admin Management Portal
          </h1>
          <p className="text-zinc-400 text-xs mt-1">Manage movies, theatres, show schedules, bookings, and analytics.</p>
        </div>

        {/* Global Notification */}
        {actionMessage && (
          <div className={`px-4 py-2 rounded-lg text-xs font-medium border ${actionMessage.isError ? 'bg-red-950/80 border-red-800 text-red-300' : 'bg-zinc-900 border-zinc-700 text-zinc-200'}`}>
            {actionMessage.text}
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-3 mb-8 overflow-x-auto">
        {[
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'movies', label: 'Movies', icon: Film, count: movies.length },
          { id: 'theatres', label: 'Theatres', icon: Building2, count: theatres.length },
          { id: 'shows', label: 'Shows & Schedules', icon: Calendar, count: shows.length },
          { id: 'bookings', label: 'All Bookings', icon: Ticket, count: bookings.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-zinc-200 text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Tab 1: Analytics ────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
          {loadingDashboard || !dashboardData ? (
            <div className="flex items-center justify-center p-16">
              <div className="w-8 h-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', value: `₹${dashboardData.summary?.total_revenue || 0}`, icon: <TrendingUp className="text-zinc-300 w-5 h-5" /> },
                  { label: 'Tickets Sold', value: dashboardData.summary?.total_tickets_sold || 0, icon: <Ticket className="text-zinc-300 w-5 h-5" /> },
                  { label: 'Total Bookings', value: dashboardData.summary?.total_bookings || 0, icon: <CheckCircle2 className="text-zinc-300 w-5 h-5" /> },
                  { label: 'Total Shows Active', value: dashboardData.summary?.totalShows || 0, icon: <Calendar className="text-zinc-300 w-5 h-5" /> },
                ].map((stat, i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-zinc-400 text-xs font-medium mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                      </div>
                      <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800">{stat.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Daily Revenue Chart */}
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
                  <h2 className="text-sm font-semibold flex items-center gap-2 text-white">
                    <TrendingUp className="w-4 h-4 text-zinc-400" />
                    Daily Revenue (Last 30 Days)
                  </h2>
                  <div className="h-44 flex items-end gap-1.5 pt-2">
                    {dashboardData.dailyRevenue?.length === 0 ? (
                      <div className="w-full text-center text-zinc-500 text-xs">No revenue data recorded yet.</div>
                    ) : (
                      dashboardData.dailyRevenue?.map((day, i) => {
                        const maxRevenue = Math.max(...dashboardData.dailyRevenue.map((d) => parseFloat(d.revenue || 0)));
                        const height = maxRevenue > 0 ? (parseFloat(day.revenue || 0) / maxRevenue) * 100 : 0;
                        return (
                          <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-zinc-950 px-2 py-1 rounded text-[10px] whitespace-nowrap transition-opacity border border-zinc-700 z-10 text-white">
                              ₹{day.revenue} <br />
                              <span className="text-zinc-400">{new Date(day.date).toLocaleDateString()}</span>
                            </div>
                            <div className="w-full bg-zinc-400 hover:bg-white rounded-t-sm transition-all" style={{ height: `${Math.max(4, height)}%` }} />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
                  <h2 className="text-sm font-semibold flex items-center gap-2 text-white">
                    <Ticket className="w-4 h-4 text-zinc-400" />
                    Booking Status
                  </h2>
                  <div className="grid grid-cols-2 gap-2.5">
                    {dashboardData.statusBreakdown?.map((status, i) => (
                      <div key={i} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-center">
                        <div className="text-lg font-bold text-white">{status.count}</div>
                        <div className="text-[10px] text-zinc-400 uppercase font-medium">{status.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Tab 2: Movies Management ──────────────────────────────────── */}
      {activeTab === 'movies' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">All Movies ({movies.length})</h2>
            <button
              onClick={openMovieCreate}
              className="flex items-center gap-2 bg-white text-zinc-950 hover:bg-zinc-200 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Movie
            </button>
          </div>

          {loadingMovies ? (
            <div className="flex justify-center p-12"><div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : movies.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 text-sm">
              No movies found. Click "Add Movie" to create your first movie.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {movies.map((m) => (
                <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between group">
                  <div className="flex gap-3">
                    <div className="w-16 h-22 bg-zinc-950 rounded-lg overflow-hidden shrink-0 border border-zinc-800">
                      {m.posterUrl ? (
                        <img src={m.posterUrl} alt={m.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700"><Film className="w-6 h-6" /></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm text-white truncate">{m.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{m.genre} • {m.duration} min</p>
                      <p className="text-[11px] text-zinc-500">{m.language} • ⭐ {m.rating}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Release: {m.releaseDate || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800/80">
                    <button
                      onClick={() => openMovieEdit(m)}
                      className="p-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded-md border border-zinc-800 transition-colors"
                      title="Edit Movie"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMovieDelete(m.id)}
                      className="p-1.5 bg-zinc-950 hover:bg-red-950/60 text-red-400 rounded-md border border-zinc-800 hover:border-red-800 transition-colors"
                      title="Delete Movie"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab 3: Theatres Management ────────────────────────────────── */}
      {activeTab === 'theatres' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Theatres & Venues ({theatres.length})</h2>
            <button
              onClick={openTheatreCreate}
              className="flex items-center gap-2 bg-white text-zinc-950 hover:bg-zinc-200 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Theatre
            </button>
          </div>

          {loadingTheatres ? (
            <div className="flex justify-center p-12"><div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : theatres.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 text-sm">
              No theatres added yet.
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Theatre Name</th>
                    <th className="py-3 px-4 font-semibold">City</th>
                    <th className="py-3 px-4 font-semibold">Address</th>
                    <th className="py-3 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {theatres.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-white">{t.name}</td>
                      <td className="py-3 px-4 text-zinc-300">
                        <span className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-[11px]">{t.city}</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{t.address || 'Standard screen hall'}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button onClick={() => openTheatreEdit(t)} className="p-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleTheatreDelete(t.id)} className="p-1.5 bg-zinc-950 hover:bg-red-950/60 text-red-400 rounded border border-zinc-800 hover:border-red-800 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Tab 4: Shows & Schedules ──────────────────────────────────── */}
      {activeTab === 'shows' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Show Schedules ({shows.length})</h2>
            <button
              onClick={openShowCreate}
              className="flex items-center gap-2 bg-white text-zinc-950 hover:bg-zinc-200 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Show
            </button>
          </div>

          {loadingShows ? (
            <div className="flex justify-center p-12"><div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : shows.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 text-sm">
              No shows scheduled. Click "Create Show" to link a movie to a theatre.
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Movie</th>
                    <th className="py-3 px-4 font-semibold">Theatre & City</th>
                    <th className="py-3 px-4 font-semibold">Date & Time</th>
                    <th className="py-3 px-4 font-semibold">Ticket Price</th>
                    <th className="py-3 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {shows.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-white">{s.movie?.title || 'Unknown Movie'}</td>
                      <td className="py-3 px-4 text-zinc-300">
                        {s.theatre?.name} <span className="text-zinc-500">({s.theatre?.city})</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        <span className="font-mono">{s.showDate}</span> at <span className="font-mono text-white">{s.showTime}</span>
                      </td>
                      <td className="py-3 px-4 text-white font-semibold">₹{s.price}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button onClick={() => openShowEdit(s)} className="p-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleShowDelete(s.id)} className="p-1.5 bg-zinc-950 hover:bg-red-950/60 text-red-400 rounded border border-zinc-800 hover:border-red-800 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Tab 5: Bookings Management ────────────────────────────────── */}
      {activeTab === 'bookings' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white">All Bookings ({bookings.length})</h2>
            <div className="flex items-center gap-2">
              <select
                value={bookingFilterStatus}
                onChange={(e) => setBookingFilterStatus(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PENDING">PENDING</option>
                <option value="PAYMENT_INITIATED">PAYMENT_INITIATED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
              <button
                onClick={fetchBookings}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-800 transition-colors"
                title="Refresh Bookings"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loadingBookings ? (
            <div className="flex justify-center p-12"><div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" /></div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 text-sm">
              No bookings found matching filter.
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Booking ID</th>
                    <th className="py-3 px-4 font-semibold">Seats</th>
                    <th className="py-3 px-4 font-semibold">Amount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-300">{b.id.slice(0, 8)}...</td>
                      <td className="py-3 px-4 text-zinc-200">
                        <span className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-[11px]">
                          {Array.isArray(b.seatNumbers) ? b.seatNumbers.join(', ') : 'Seats'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-semibold">₹{b.totalAmount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          b.status === 'CONFIRMED'
                            ? 'bg-zinc-100 text-zinc-950'
                            : b.status === 'CANCELLED'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 text-[11px]">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 rounded border border-red-800 text-[11px] font-medium transition-colors"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL: Movie Add/Edit ────────────────────────────────────── */}
      {movieModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">{editingMovie ? 'Edit Movie' : 'Add New Movie'}</h3>
              <button onClick={() => setMovieModalOpen(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleMovieSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-300 font-medium block mb-1">Movie Title *</label>
                <input
                  type="text"
                  required
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  placeholder="e.g. Inception"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">Genre</label>
                  <input
                    type="text"
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                    placeholder="Action, Sci-Fi"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">Language</label>
                  <input
                    type="text"
                    value={movieForm.language}
                    onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                    placeholder="English"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={movieForm.duration}
                    onChange={(e) => setMovieForm({ ...movieForm, duration: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">Release Date</label>
                  <input
                    type="date"
                    value={movieForm.releaseDate}
                    onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">Rating (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={movieForm.rating}
                    onChange={(e) => setMovieForm({ ...movieForm, rating: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-zinc-300 font-medium block mb-1">Poster URL</label>
                <input
                  type="url"
                  value={movieForm.posterUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div>
                <label className="text-zinc-300 font-medium block mb-1">Description</label>
                <textarea
                  rows="3"
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  placeholder="Movie plot overview..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setMovieModalOpen(false)} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white border border-zinc-800">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-lg">
                  Save Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Theatre Add/Edit ──────────────────────────────────── */}
      {theatreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">{editingTheatre ? 'Edit Theatre' : 'Add New Theatre'}</h3>
              <button onClick={() => setTheatreModalOpen(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleTheatreSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-300 font-medium block mb-1">Theatre Name *</label>
                <input
                  type="text"
                  required
                  value={theatreForm.name}
                  onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                  placeholder="e.g. PVR ICON"
                />
              </div>
              <div>
                <label className="text-zinc-300 font-medium block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={theatreForm.city}
                  onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                  placeholder="e.g. Mumbai"
                />
              </div>
              <div>
                <label className="text-zinc-300 font-medium block mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={theatreForm.address}
                  onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                  placeholder="e.g. Phoenix Mall, Lower Parel"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setTheatreModalOpen(false)} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white border border-zinc-800">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-lg">
                  Save Theatre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Show Create/Edit ──────────────────────────────────── */}
      {showModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">{editingShow ? 'Edit Show Schedule' : 'Schedule New Show'}</h3>
              <button onClick={() => setShowModalOpen(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleShowSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-300 font-medium block mb-1">Select Movie *</label>
                <select
                  required
                  value={showForm.movieId}
                  onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="">-- Choose Movie --</option>
                  {movies.length === 0 ? (
                    <option disabled value="">(No movies found - Go to Movies tab to add one)</option>
                  ) : (
                    movies.map((m) => (
                      <option key={m.id} value={m.id}>{m.title} ({m.language || 'English'})</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="text-zinc-300 font-medium block mb-1">Select Theatre *</label>
                <select
                  required
                  value={showForm.theatreId}
                  onChange={(e) => setShowForm({ ...showForm, theatreId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="">-- Choose Theatre --</option>
                  {theatres.length === 0 ? (
                    <option disabled value="">(No theatres found - Go to Theatres tab to add one)</option>
                  ) : (
                    theatres.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                    ))
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">Show Date *</label>
                  <input
                    type="date"
                    required
                    value={showForm.showDate}
                    onChange={(e) => setShowForm({ ...showForm, showDate: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 font-medium block mb-1">Show Time *</label>
                  <input
                    type="time"
                    required
                    value={showForm.showTime}
                    onChange={(e) => setShowForm({ ...showForm, showTime: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-zinc-300 font-medium block mb-1">Ticket Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={showForm.price}
                  onChange={(e) => setShowForm({ ...showForm, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setShowModalOpen(false)} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white border border-zinc-800">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-lg">
                  {editingShow ? 'Update Show' : 'Create Show & Generate 50 Seats'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
