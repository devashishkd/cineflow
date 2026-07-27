import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCity } from '../context/CityContext';
import { Film, Star, MapPin, ChevronRight } from 'lucide-react';

const MovieCard = ({ movie }) => (
  <Link
    to={`/movie/${movie.id}`}
    className="group flex flex-col rounded-2xl overflow-hidden border border-white/5 hover:border-neonPurple/40 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-neonPurple/10 bg-charcoal"
  >
    <div className="aspect-[2/3] relative overflow-hidden bg-gradient-to-br from-neonPurple/10 to-neonTeal/10">
      {movie.posterUrl ? (
        <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Film className="w-10 h-10 text-white/10" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent opacity-80" />
      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] border border-white/10 text-neonTeal font-semibold">
        {movie.genre || 'Cinema'}
      </div>
      {movie.rating > 0 && (
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] border border-yellow-400/20 text-yellow-400 font-semibold flex items-center gap-1">
          <Star className="w-2.5 h-2.5 fill-yellow-400" />
          {movie.rating}
        </div>
      )}
    </div>
    <div className="p-4 flex flex-col gap-2">
      <h3 className="text-sm font-bold group-hover:text-neonTeal transition-colors leading-tight line-clamp-2">{movie.title}</h3>
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>{movie.duration} mins</span>
        <span className="text-neonPurple font-semibold">Book Now →</span>
      </div>
    </div>
  </Link>
);

const UpcomingCard = ({ movie }) => (
  <div className="group flex flex-col rounded-2xl overflow-hidden border border-white/5 bg-charcoal opacity-80">
    <div className="aspect-[2/3] relative overflow-hidden bg-gradient-to-br from-neonPurple/10 to-neonTeal/10">
      {movie.posterUrl ? (
        <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Film className="w-10 h-10 text-white/10" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent opacity-80" />
      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] border border-white/10 text-white/70 font-semibold">
        {movie.genre || 'Cinema'}
      </div>
      <div className="absolute top-3 left-3 bg-neonPurple/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white font-semibold">
        Coming Soon
      </div>
    </div>
    <div className="p-4 flex flex-col gap-2">
      <h3 className="text-sm font-bold leading-tight line-clamp-2">{movie.title}</h3>
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>{movie.duration} mins</span>
        <span className="text-neonTeal font-semibold">Coming Soon</span>
      </div>
    </div>
  </div>
);

const Home = () => {
  const { selectedCity, setIsCityModalOpen } = useCity();
  const [nowShowing, setNowShowing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCity) return;
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const query = selectedCity && selectedCity !== 'All Cities' ? `city=${encodeURIComponent(selectedCity)}` : '';
        const [nowShowingRes, upcomingRes] = await Promise.all([
          api.get(`/movies?status=now_showing&${query}`),
          api.get('/movies?status=upcoming'),
        ]);
        setNowShowing(nowShowingRes.data.data || []);
        setUpcoming(upcomingRes.data.data || []);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [selectedCity]);

  return (
    <div className="flex flex-col animate-fade-in w-full">
      {/* Hero */}
      <div className="relative h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-obsidian/40 to-obsidian z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop')" }}
        />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-neonPurple/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-neonTeal/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="z-20 text-center space-y-6 max-w-3xl px-4 w-full">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-neonPurple to-neonTeal bg-clip-text text-transparent drop-shadow-2xl leading-tight">
            Book Your Next<br />Experience
          </h1>
          <p className="text-lg text-white/60 font-light">Premium cinema at your fingertips.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-16 -mt-20 z-20 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <Film className="w-7 h-7 text-neonTeal" />
            <h2 className="text-3xl font-bold">Now Showing</h2>
          </div>

        </div>

        {!selectedCity ? (
          <div className="text-center py-32 glass-card rounded-3xl border border-white/10 bg-charcoal">
            <MapPin className="w-16 h-16 text-white/20 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-3">Welcome to Cineflow</h3>
            <p className="text-white/50 mb-8 max-w-md mx-auto">Select your city to see movies currently playing near you.</p>
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="px-8 py-3 bg-gradient-to-r from-neonTeal to-neonPurple text-white rounded-full font-bold shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-105 transition-transform"
            >
              Select City
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[2/3] glass-card rounded-2xl animate-pulse bg-white/5" />
            ))}
          </div>
        ) : nowShowing.length === 0 ? (
          <div className="text-center py-24 text-white/30 glass-card rounded-3xl border border-white/5">
            <Film className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">No movies found in {selectedCity}</p>
            <p className="text-sm mt-2 opacity-50">Try selecting a different city</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-8">
              {nowShowing.slice(0, 5).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            <div className="flex justify-center mb-16">
              <Link to="/movies" className="flex items-center gap-2 px-8 py-3 border border-neonTeal/40 text-neonTeal rounded-full hover:bg-neonTeal/10 transition-all font-semibold text-sm">
                View All Movies <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center space-x-3 mb-8">
                  <Star className="w-7 h-7 text-neonPurple" />
                  <h2 className="text-3xl font-bold">Upcoming Releases</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-8">
                  {upcoming.slice(0, 5).map((movie) => (
                    <UpcomingCard key={movie.id} movie={movie} />
                  ))}
                </div>
                <div className="flex justify-center">
                  <Link to="/movies?tab=upcoming" className="flex items-center gap-2 px-8 py-3 border border-neonPurple/40 text-neonPurple rounded-full hover:bg-neonPurple/10 transition-all font-semibold text-sm">
                    View All Upcoming <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
