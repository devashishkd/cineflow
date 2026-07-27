import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCity } from '../context/CityContext';
import { Clock, MapPin, Calendar, ChevronRight, Film, Star, ChevronLeft } from 'lucide-react';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedCity } = useCity();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate next 5 dates for the selector
  const next5Days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  const [selectedDate, setSelectedDate] = useState(next5Days[0]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [movieRes, showsRes, allMoviesRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get(`/movies/${id}/shows`),
          api.get('/movies'),
        ]);
        setMovie(movieRes.data.data);
        setShows(showsRes.data.data || []);
        setAllMovies(allMoviesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  // Re-fetch shows when city changes
  useEffect(() => {
    if (!movie) return;
    const fetchShows = async () => {
      try {
        const params = selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : '';
        const res = await api.get(`/movies/${id}/shows${params}`);
        setShows(res.data.data || []);
      } catch (err) {
        console.error('Error fetching shows:', err);
      }
    };
    fetchShows();
  }, [selectedCity, id, movie]);

  // Filter shows by selected date
  const showsForDate = shows.filter(show => show.showDate === selectedDate);

  // Group shows by theatre
  const showsByTheatre = showsForDate.reduce((acc, show) => {
    const theatreName = show.theatre?.name || 'Unknown Theatre';
    if (!acc[theatreName]) acc[theatreName] = [];
    acc[theatreName].push(show);
    return acc;
  }, {});

  // Recommendations: same genre, excluding current
  const recommendations = allMovies
    .filter(m => m.id !== id && m.genre === movie?.genre)
    .slice(0, 6);

  if (loading) return (
    <div className="flex-grow flex items-center justify-center">
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-neonTeal animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
  if (!movie) return <div className="flex-grow flex items-center justify-center text-white/50">Movie not found.</div>;

  return (
    <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-12 animate-fade-in">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white mb-6 transition-colors text-sm">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Movie Hero */}
      <div className="glass-card rounded-3xl p-6 md:p-8 mb-10 flex flex-col md:flex-row gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-neonPurple/15 blur-[120px] rounded-full pointer-events-none" />

        {/* Poster */}
        <div className="w-full md:w-56 flex-shrink-0 aspect-[2/3] bg-gradient-to-br from-charcoal to-obsidian rounded-2xl border border-white/10 overflow-hidden">
          {movie.posterUrl ? (
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/20">
              <Film className="w-12 h-12" />
              <span className="text-xs font-bold tracking-widest uppercase">{movie.genre}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-grow flex flex-col justify-center relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neonPurple/20 border border-neonPurple/30 text-neonPurple">
              {movie.genre}
            </span>
            {movie.language && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50">
                {movie.language}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{movie.title}</h1>
          <p className="text-white/60 mb-6 leading-relaxed max-w-xl">{movie.description}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neonTeal" />
              <span>{movie.duration} mins</span>
            </div>
            {movie.rating > 0 && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{movie.rating} / 10</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date & City Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-3 flex-shrink-0">
          <Calendar className="w-6 h-6 text-neonPurple" />
          Available Shows
        </h2>
        {selectedCity && (
          <span className="text-sm text-neonTeal bg-neonTeal/10 px-3 py-1 rounded-full border border-neonTeal/20">
            Filtering by: {selectedCity}
          </span>
        )}
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {next5Days.map(dateStr => {
          const d = new Date(dateStr + 'T00:00:00');
          const dayName = d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
          const dayNum = d.toLocaleDateString(undefined, { day: '2-digit' });
          const month = d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
          
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex flex-col items-center justify-center min-w-[72px] py-2.5 rounded-xl border transition-all flex-shrink-0 ${
                isSelected 
                  ? 'bg-neonTeal/20 border-neonTeal text-neonTeal shadow-[0_0_15px_rgba(20,184,166,0.2)]' 
                  : 'bg-white/5 border-white/10 hover:border-white/30 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-[10px] font-bold mb-0.5">{dayName}</span>
              <span className={`text-xl font-bold leading-none mb-0.5 ${isSelected ? 'text-white' : ''}`}>{dayNum}</span>
              <span className="text-[10px] font-bold leading-none">{month}</span>
            </button>
          );
        })}
      </div>

      {/* Shows grouped by theatre */}
      {Object.keys(showsByTheatre).length === 0 ? (
        <div className="glass-card p-8 rounded-2xl text-center text-white/40">
          No shows available for this selection.
        </div>
      ) : (
        <div className="space-y-6 mb-16">
          {Object.entries(showsByTheatre).map(([theatreName, theatreShows]) => (
            <div key={theatreName} className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-neonTeal" />
                <h3 className="font-bold text-white">{theatreName}</h3>
                {theatreShows[0]?.theatre?.city && (
                  <span className="text-xs text-white/40 ml-1">· {theatreShows[0].theatre.city}</span>
                )}
              </div>
              <div className="p-6 flex flex-wrap gap-3">
                {theatreShows.map(show => (
                  <Link
                    key={show.id}
                    to={`/show/${show.id}/seats`}
                    className="group flex flex-col items-center gap-1 px-5 py-3 rounded-xl border border-white/10 hover:border-neonTeal/60 hover:bg-neonTeal/5 transition-all"
                  >
                    <span className="text-lg font-bold text-neonTeal group-hover:text-neonTeal/80">
                      {show.showTime?.slice(0, 5)}
                    </span>
                    <span className="text-xs text-white/40">
                      {new Date(show.showDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs font-semibold text-neonPurple mt-1">₹{show.price}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* You May Also Like */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">You May Also Like</h2>
            <span className="text-sm text-neonTeal">{movie.genre}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.map(rec => (
              <Link
                key={rec.id}
                to={`/movie/${rec.id}`}
                className="group flex flex-col rounded-xl overflow-hidden border border-white/5 hover:border-neonPurple/40 transition-all hover:scale-105 duration-300 hover:shadow-lg hover:shadow-neonPurple/10"
              >
                <div className="aspect-[2/3] bg-gradient-to-br from-charcoal to-obsidian flex items-center justify-center overflow-hidden">
                  {rec.posterUrl ? (
                    <img src={rec.posterUrl} alt={rec.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <Film className="w-8 h-8 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                  )}
                </div>
                <div className="p-3 bg-charcoal">
                  <p className="text-xs font-semibold text-white/90 truncate">{rec.title}</p>
                  <p className="text-xs text-white/30 mt-0.5">{rec.duration} mins</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
