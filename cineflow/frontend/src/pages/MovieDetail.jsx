import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Clock, Calendar, ChevronRight } from 'lucide-react';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const [movieRes, showsRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get(`/movies/${id}/shows`)
        ]);
        setMovie(movieRes.data.data);
        setShows(showsRes.data.data || []);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  if (loading) return <div className="flex-grow flex items-center justify-center">Loading...</div>;
  if (!movie) return <div className="flex-grow flex items-center justify-center">Movie not found.</div>;

  return (
    <div className="max-w-6xl mx-auto w-full px-8 py-12 animate-fade-in">
      <div className="glass-card rounded-3xl p-8 mb-12 flex flex-col md:flex-row gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neonPurple/20 blur-[100px] rounded-full" />
        
        <div className="w-full md:w-1/3 aspect-[2/3] bg-gradient-to-br from-charcoal to-obsidian rounded-2xl border border-white/10 flex items-center justify-center">
          <span className="text-white/20 text-xl font-bold tracking-widest uppercase">{movie.genre || 'Cinema'}</span>
        </div>
        
        <div className="w-full md:w-2/3 flex flex-col justify-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{movie.title}</h1>
          <p className="text-lg text-white/70 mb-6">{movie.description}</p>
          
          <div className="flex items-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-neonTeal" />
              <span>{movie.duration} Minutes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Calendar className="w-6 h-6 text-neonPurple" />
          Available Shows
        </h2>
        
        {shows.length === 0 ? (
          <div className="glass-card p-6 rounded-xl text-center text-white/50">
            No shows available currently.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.map((show) => (
              <Link
                to={`/show/${show.id}/seats`}
                key={show.id}
                className="group glass-card p-6 rounded-xl hover:border-neonTeal/50 hover:bg-white/[0.02] transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-xl font-bold text-neonTeal mb-1">
                    {show.showTime.slice(0,5)}
                  </div>
                  <div className="text-sm text-white/60">
                    {new Date(show.showDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-sm font-semibold mt-2 text-neonPurple">₹{show.price}</div>
                </div>
                <ChevronRight className="w-6 h-6 text-white/20 group-hover:text-neonTeal group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
