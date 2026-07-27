import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Film, Star, Search, ChevronDown, LayoutGrid, List } from 'lucide-react';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Thriller', 'Comedy', 'Horror', 'Crime', 'Romance', 'Hindi'];

const MovieCard = ({ movie, isUpcoming = false }) => (
  <Link
    to={isUpcoming ? '#' : `/movie/${movie.id}`}
    className={`group flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 bg-charcoal ${
      isUpcoming
        ? 'border-white/5 cursor-default opacity-80'
        : 'border-white/5 hover:border-neonPurple/40 hover:scale-[1.03] hover:shadow-xl hover:shadow-neonPurple/10'
    }`}
    onClick={isUpcoming ? (e) => e.preventDefault() : undefined}
  >
    <div className="aspect-[2/3] relative overflow-hidden bg-gradient-to-br from-neonPurple/10 to-neonTeal/10">
      {movie.posterUrl ? (
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className={`w-full h-full object-cover ${!isUpcoming ? 'group-hover:scale-105 transition-transform duration-500' : ''}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Film className="w-12 h-12 text-white/10" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent opacity-80" />
      {/* Genre */}
      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] border border-white/10 text-neonTeal font-semibold">
        {movie.genre || 'Cinema'}
      </div>
      {/* Rating or Coming Soon */}
      {isUpcoming ? (
        <div className="absolute top-3 left-3 bg-neonPurple/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white font-semibold">
          Coming Soon
        </div>
      ) : movie.rating > 0 ? (
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] border border-yellow-400/20 text-yellow-400 font-semibold flex items-center gap-1">
          <Star className="w-2.5 h-2.5 fill-yellow-400" />
          {movie.rating}
        </div>
      ) : null}
    </div>
    <div className="p-4 flex flex-col gap-1.5">
      <h3 className={`text-sm font-bold leading-tight line-clamp-2 ${!isUpcoming ? 'group-hover:text-neonTeal transition-colors' : ''}`}>
        {movie.title}
      </h3>
      <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">{movie.description}</p>
      <div className="flex items-center justify-between text-xs text-white/40 mt-1">
        <span>{movie.language} · {movie.duration}m</span>
        <span className={`font-semibold ${isUpcoming ? 'text-neonPurple' : 'text-neonTeal'}`}>
          {isUpcoming ? 'Coming Soon' : 'Book Now →'}
        </span>
      </div>
    </div>
  </Link>
);

const AllMovies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'upcoming' ? 'upcoming' : 'all';

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(defaultTab); // 'all' | 'now_showing' | 'upcoming'
  const [genre, setGenre] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [nowRes, upRes] = await Promise.all([
          api.get('/movies?status=now_showing'),
          api.get('/movies?status=upcoming'),
        ]);
        const now = (nowRes.data.data || []).map((m) => ({ ...m, _status: 'now_showing' }));
        const up = (upRes.data.data || []).map((m) => ({ ...m, _status: 'upcoming' }));
        setMovies([...now, ...up]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = movies.filter((m) => {
    const matchTab =
      tab === 'all' ? true :
      tab === 'now_showing' ? m._status === 'now_showing' :
      m._status === 'upcoming';
    const matchGenre = genre === 'All' ? true : m.genre === genre || m.language === genre;
    const matchSearch = search.trim() === '' ? true :
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.genre || '').toLowerCase().includes(search.toLowerCase());
    return matchTab && matchGenre && matchSearch;
  });

  const tabs = [
    { id: 'all', label: 'All Movies' },
    { id: 'now_showing', label: 'Now Showing' },
    { id: 'upcoming', label: 'Upcoming' },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-10 animate-fade-in">


      {/* Controls */}
      <div className="flex flex-col gap-6 mb-8">
        {/* Top Row: Tabs & Search */}
        <div className="flex flex-col md:flex-row items-stretch gap-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10 w-fit flex-shrink-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t.id
                    ? 'bg-gradient-to-r from-neonPurple to-neonTeal text-white shadow-lg'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-grow w-full md:w-auto max-w-sm flex items-center bg-white/5 border border-white/10 rounded-xl px-3 focus-within:border-neonTeal/50 transition-colors">
            <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent pl-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none h-full"
            />
          </div>
        </div>

        {/* Bottom Row: Genre filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                genre === g
                  ? 'bg-neonTeal/20 border-neonTeal/50 text-neonTeal'
                  : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/70'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-white/30 text-sm mb-6">
        {loading ? 'Loading...' : `${filtered.length} movie${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="aspect-[2/3] glass-card rounded-2xl animate-pulse bg-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-32 text-white/30">
          <Film className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No movies found</p>
          <p className="text-sm mt-2 opacity-50">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {filtered.map((movie) => (
            <MovieCard key={movie.id} movie={movie} isUpcoming={movie._status === 'upcoming'} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllMovies;
