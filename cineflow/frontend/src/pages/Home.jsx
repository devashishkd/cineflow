import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Film } from 'lucide-react';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await api.get('/movies');
        // movie-service returns { success, data: movies }
        setMovies(response.data.data || []);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="flex flex-col animate-fade-in w-full">
      {/* Hero Section */}
      <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-obsidian z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
        
        <div className="z-20 text-center space-y-4 max-w-3xl px-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-neonPurple to-neonTeal bg-clip-text text-transparent drop-shadow-2xl">
            Book Your Next Experience
          </h1>
          <p className="text-xl text-white/80 font-light">
            Premium cinema at your fingertips.
          </p>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto w-full px-8 py-16 -mt-20 z-20">
        <div className="flex items-center space-x-3 mb-8">
          <Film className="w-8 h-8 text-neonTeal" />
          <h2 className="text-3xl font-bold">Now Showing</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 glass-card rounded-2xl animate-pulse bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {movies.map((movie) => (
              <Link 
                to={`/movie/${movie.id}`} 
                key={movie.id}
                className="group glass-card rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-neonPurple/20 hover:shadow-2xl flex flex-col h-full"
              >
                <div className="h-64 bg-charcoal relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian to-transparent z-10 opacity-60" />
                  {/* We don't have a posterUrl in the backend currently, so we use a placeholder or random gradient */}
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-teal-900/40 flex items-center justify-center">
                    <Film className="w-16 h-16 text-white/20 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs border border-white/10 text-neonTeal font-medium">
                    {movie.genre || 'Action'}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-neonTeal transition-colors">{movie.title}</h3>
                  <div className="flex items-center justify-between text-sm text-white/50 mt-auto">
                    <span>{movie.duration} mins</span>
                    <span className="text-neonPurple font-semibold border border-neonPurple/30 px-2 py-1 rounded-md bg-neonPurple/10">Book Now</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
