import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCity } from '../context/CityContext';
import { Film, Star, MapPin, ChevronRight, Clock, ArrowRight } from 'lucide-react';

const MovieCard = ({ movie }) => (
  <Link
    to={`/movie/${movie.id}`}
    className="group flex flex-col rounded-2xl overflow-hidden border border-zinc-800/60 hover:border-zinc-600 transition-all duration-300 bg-zinc-900 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1"
  >
    <div className="aspect-[2/3] relative overflow-hidden bg-zinc-950">
      {movie.posterUrl ? (
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Film className="w-12 h-12 text-zinc-700" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] border border-white/10 text-zinc-300 font-medium tracking-wide uppercase">
        {movie.genre || 'Cinema'}
      </div>
      {movie.rating > 0 && (
        <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] border border-white/10 text-zinc-200 font-medium flex items-center gap-1">
          <Star className="w-2.5 h-2.5 fill-zinc-300 text-zinc-300" />
          {movie.rating}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-3 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        <div className="bg-white text-zinc-950 text-[11px] font-semibold py-1.5 rounded-lg text-center tracking-wide">
          Book Now
        </div>
      </div>
    </div>
    <div className="p-3.5 flex flex-col gap-1.5">
      <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors leading-snug line-clamp-1">
        {movie.title}
      </h3>
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
        <Clock className="w-3 h-3" />
        <span>{movie.duration} min</span>
      </div>
    </div>
  </Link>
);

const UpcomingCard = ({ movie }) => (
  <div className="group flex flex-col rounded-2xl overflow-hidden border border-zinc-800/60 bg-zinc-900/60">
    <div className="aspect-[2/3] relative overflow-hidden bg-zinc-950">
      {movie.posterUrl ? (
        <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover opacity-70" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Film className="w-12 h-12 text-zinc-700" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] border border-white/10 text-zinc-400 font-medium uppercase tracking-wide">
        {movie.genre || 'Cinema'}
      </div>
      <div className="absolute top-2.5 left-2.5 bg-zinc-800/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] text-zinc-300 font-medium border border-zinc-700">
        Soon
      </div>
    </div>
    <div className="p-3.5 flex flex-col gap-1.5">
      <h3 className="text-sm font-semibold text-zinc-400 leading-snug line-clamp-1">{movie.title}</h3>
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
        <Clock className="w-3 h-3" />
        <span>{movie.duration} min</span>
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
    <div className="flex flex-col w-full bg-zinc-950 min-h-screen">

      {/* ─── Hero ─── */}
      <div className="relative h-[55vh] min-h-[380px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop')",
            filter: 'grayscale(100%) brightness(0.25)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-zinc-950 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-zinc-950/70 to-transparent" />

        <div className="relative z-10 text-center px-4 max-w-3xl w-full space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs text-zinc-400 font-medium tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
            Now Booking
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-none">
            Your Next<br />
            <span className="text-zinc-400">Cinema Night</span>
          </h1>

          <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
            Browse, pick your seat, and book in seconds — for every movie playing near you.
          </p>

          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="inline-flex items-center gap-2 bg-white text-zinc-950 hover:bg-zinc-100 font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-200"
            >
              <MapPin className="w-4 h-4" />
              {selectedCity && selectedCity !== 'All Cities' ? selectedCity : 'Choose City'}
            </button>
            <Link
              to="/movies"
              className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium text-sm px-6 py-2.5 rounded-xl transition-all duration-200"
            >
              All Movies
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-14">

        {/* Now Showing header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-white" />
            <h2 className="text-xl font-bold text-white tracking-tight">Now Showing</h2>
            {selectedCity && selectedCity !== 'All Cities' && (
              <span className="text-xs text-zinc-500 font-medium px-2.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded-full">
                {selectedCity}
              </span>
            )}
          </div>
          {nowShowing.length > 0 && (
            <Link to="/movies" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {!selectedCity ? (
          <div className="text-center py-24 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 max-w-lg mx-auto px-8">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-5">
              <MapPin className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Select your city</h3>
            <p className="text-zinc-500 mb-7 text-sm leading-relaxed">
              Choose a city to see movies currently playing near you.
            </p>
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="px-6 py-2.5 bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-semibold rounded-xl transition-colors"
            >
              Choose City
            </button>
          </div>

        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="aspect-[2/3] rounded-2xl animate-pulse bg-zinc-900 border border-zinc-800" />
                <div className="h-3 rounded bg-zinc-900 animate-pulse w-3/4" />
                <div className="h-3 rounded bg-zinc-900 animate-pulse w-1/2" />
              </div>
            ))}
          </div>

        ) : nowShowing.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-zinc-800/60 bg-zinc-900/40">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-5">
              <Film className="w-6 h-6 text-zinc-500" />
            </div>
            <p className="font-semibold text-base text-zinc-200 mb-1">No movies in {selectedCity}</p>
            <p className="text-xs text-zinc-500 mb-6">Try selecting a different city</p>
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="text-xs px-5 py-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-lg transition-colors"
            >
              Change City
            </button>
          </div>

        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
              {nowShowing.slice(0, 10).map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {nowShowing.length > 5 && (
              <div className="flex justify-center mb-16">
                <Link
                  to="/movies"
                  className="flex items-center gap-2 px-7 py-2.5 border border-zinc-800 hover:border-zinc-600 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-all text-xs font-medium"
                >
                  View All Movies <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-zinc-800" />
                </div>

                <div className="flex items-center justify-between mb-7">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full bg-zinc-600" />
                    <h2 className="text-xl font-bold text-white tracking-tight">Coming Soon</h2>
                  </div>
                  <Link to="/movies?tab=upcoming" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
                    See all <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
                  {upcoming.slice(0, 5).map((movie) => (
                    <UpcomingCard key={movie.id} movie={movie} />
                  ))}
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

