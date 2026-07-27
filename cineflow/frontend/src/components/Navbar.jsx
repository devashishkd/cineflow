import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import { Film, User, LogOut, Ticket, HeadphonesIcon, Settings, ChevronDown, Search, X, MapPin } from 'lucide-react';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { selectedCity, setIsCityModalOpen } = useCity();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const dropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch movies for search
  useEffect(() => {
    api.get('/movies').then(r => setAllMovies(r.data.data || [])).catch(() => {});
  }, []);

  // Filter on query change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    setSearchResults(
      allMovies.filter(m =>
        m.title.toLowerCase().includes(q) || (m.genre || '').toLowerCase().includes(q)
      ).slice(0, 6)
    );
  }, [searchQuery, allMovies]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const handleSearchSelect = (movieId) => {
    setSearchQuery('');
    navigate(`/movie/${movieId}`);
  };

  return (
    <header className="px-6 py-4 border-b border-white/10 backdrop-blur-md sticky top-0 z-50 bg-obsidian/90">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
          <Film className="w-7 h-7 text-neonTeal group-hover:text-neonPurple transition-colors duration-300" />
          <span className="text-xl font-bold bg-gradient-to-r from-neonPurple to-neonTeal bg-clip-text text-transparent">
            Cineflow
          </span>
        </Link>

        {/* Search bar */}
        <div ref={searchRef} className="relative hidden md:flex items-center mx-4">
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 w-[450px] backdrop-blur-md shadow-inner transition-all">
            <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search movies, genres..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent flex-grow outline-none text-sm text-white placeholder-white/30"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X className="w-4 h-4 text-white/40 hover:text-white transition-colors" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-charcoal border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
              {searchResults.map(movie => (
                <button
                  key={movie.id}
                  onClick={() => handleSearchSelect(movie.id)}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                >
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-neonPurple/30 to-neonTeal/30 flex items-center justify-center flex-shrink-0">
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt="" className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <Film className="w-4 h-4 text-white/30" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{movie.title}</div>
                    <div className="text-xs text-white/40">{movie.genre} · {movie.duration} mins</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav links + User */}
        <nav className="flex items-center gap-4 text-sm font-medium flex-shrink-0">
          
          {/* City Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-neonTeal/50 hover:bg-white/5 transition-all text-white/80"
            >
              <MapPin className="w-4 h-4 text-neonTeal" />
              <span className="max-w-[150px] truncate">{!selectedCity || selectedCity === 'All Cities' ? 'Select your city' : selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-white/40 transition-transform duration-200" />
            </button>
          </div>

          <Link to="/movies" className="hidden md:block hover:text-neonTeal transition-colors text-white/70 pl-2 border-l border-white/10">Movies</Link>


          {user ? (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/5 transition-all"
              >
                <div className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white/70">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden md:block text-white/80 max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-charcoal border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-white/40 truncate">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile/bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-white/80 hover:text-neonTeal"
                    >
                      <Ticket className="w-4 h-4" />
                      <span className="text-sm">My Bookings</span>
                    </Link>
                    <Link
                      to="/support"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-white/80 hover:text-white"
                    >
                      <HeadphonesIcon className="w-4 h-4" />
                      <span className="text-sm">Help & Support</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-white/80 hover:text-white"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Account Settings</span>
                    </Link>
                  </div>
                  <div className="border-t border-white/10 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-white/60 hover:text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <Link to="/login" className="hover:text-neonPurple transition-colors text-white/70">Login</Link>
              <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-neonPurple to-neonTeal text-white rounded-full text-sm font-semibold hover:opacity-90 transition-all">
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
