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
          api.get(`/shows/movie/${id}${selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : ''}`),
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
  }, [id, selectedCity]);

  // Re-fetch shows when city changes
  useEffect(() => {
    if (!movie) return;
    const fetchShows = async () => {
      try {
        const params = selectedCity ? `?city=${encodeURIComponent(selectedCity)}` : '';
        const res = await api.get(`/shows/movie/${id}${params}`);
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
    const theatreObj = show.theatre || show.theatreId;
    const theatreName = theatreObj?.name || 'Unknown Theatre';
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
          <div key={i} className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
  if (!movie) return <div className="flex-grow flex items-center justify-center text-zinc-500">Movie not found.</div>;

  return (
    <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-10 bg-zinc-950">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors text-xs font-medium">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Movie Hero */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-10 flex flex-col md:flex-row gap-8 relative overflow-hidden">
        {/* Poster */}
        <div className="w-full md:w-56 flex-shrink-0 aspect-[2/3] bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
          {movie.posterUrl ? (
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-600">
              <Film className="w-12 h-12" />
              <span className="text-xs font-semibold tracking-widest uppercase">{movie.genre}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-grow flex flex-col justify-center relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200">
              {movie.genre}
            </span>
            {movie.language && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400">
                {movie.language}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white tracking-tight leading-tight">{movie.title}</h1>
          <p className="text-zinc-400 mb-6 text-sm leading-relaxed max-w-2xl">{movie.description}</p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>{movie.duration} mins</span>
            </div>
            {movie.rating > 0 && (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-zinc-300 fill-zinc-300" />
                <span>{movie.rating} / 10</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date & City Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
          <Calendar className="w-5 h-5 text-zinc-400" />
          Available Shows
        </h2>
        {selectedCity && (
          <span className="text-xs text-zinc-300 bg-zinc-900 px-3 py-1 rounded-md border border-zinc-800 font-medium">
            City: {selectedCity}
          </span>
        )}
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-2.5 mb-8 overflow-x-auto pb-2 scrollbar-hide">
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
              className={`flex flex-col items-center justify-center min-w-[70px] py-2 rounded-xl border transition-all flex-shrink-0 ${
                isSelected 
                  ? 'bg-white border-white text-zinc-950 shadow-sm' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <span className="text-[10px] font-semibold mb-0.5">{dayName}</span>
              <span className={`text-lg font-bold leading-none mb-0.5 ${isSelected ? 'text-zinc-950' : 'text-zinc-200'}`}>{dayNum}</span>
              <span className="text-[10px] font-semibold leading-none">{month}</span>
            </button>
          );
        })}
      </div>

      {/* Shows grouped by theatre */}
      {Object.keys(showsByTheatre).length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl text-center text-zinc-500 mb-16 text-sm">
          No shows available for this selection.
        </div>
      ) : (
        <div className="space-y-4 mb-16">
          {Object.entries(showsByTheatre).map(([theatreName, theatreShows]) => {
            const theatreCity = theatreShows[0]?.theatre?.city || theatreShows[0]?.theatreId?.city;
            return (
              <div key={theatreName} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    <h3 className="text-sm font-semibold text-white">{theatreName}</h3>
                    {theatreCity && (
                      <span className="text-xs text-zinc-400 ml-1">· {theatreCity}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {theatreShows.length} {theatreShows.length === 1 ? 'Show' : 'Shows'} Available
                  </span>
                </div>
                <div className="p-5 flex flex-wrap gap-3">
                  {theatreShows.map(show => {
                    const showId = show.id || show._id;
                    return (
                      <Link
                        key={showId}
                        to={`/show/${showId}/seats`}
                        className="group flex flex-col items-center px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all shadow-sm"
                      >
                        <span className="text-sm font-bold text-zinc-100 group-hover:text-white">
                          {show.showTime?.slice(0, 5)}
                        </span>
                        <span className="text-xs font-semibold text-emerald-400 mt-1 flex items-center">
                          ₹{show.price}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* You May Also Like */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">You May Also Like</h2>
            <span className="text-xs text-zinc-400">{movie.genre}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.map(rec => (
              <Link
                key={rec.id}
                to={`/movie/${rec.id}`}
                className="group flex flex-col rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all bg-zinc-900"
              >
                <div className="aspect-[2/3] bg-zinc-950 flex items-center justify-center overflow-hidden">
                  {rec.posterUrl ? (
                    <img src={rec.posterUrl} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <Film className="w-8 h-8 text-zinc-700" />
                  )}
                </div>
                <div className="p-3 bg-zinc-900">
                  <p className="text-xs font-medium text-zinc-200 truncate group-hover:text-white">{rec.title}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{rec.duration} mins</p>
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
