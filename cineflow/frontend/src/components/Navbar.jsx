import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import { Film, User, LogOut, Ticket, HeadphonesIcon, Settings, ChevronDown, Search, X, MapPin, BarChart3 } from 'lucide-react';
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

  // Auto-open city modal if no city is selected
  useEffect(() => {
    if (!selectedCity) {
      setIsCityModalOpen(true);
    }
  }, [selectedCity]);

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
    <header className="px-6 py-3.5 border-b border-zinc-800 backdrop-blur-xl sticky top-0 z-50 bg-zinc-950/90">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-sm">
            <Film className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            CINE<span className="text-zinc-400">FLOW</span>
          </span>
        </Link>

        {/* Search bar */}
        <div ref={searchRef} className="relative hidden md:flex items-center mx-4">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-1.5 w-[420px] transition-all focus-within:border-zinc-600">
            <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search movies, genres..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent flex-grow outline-none text-sm text-zinc-100 placeholder-zinc-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X className="w-3.5 h-3.5 text-zinc-400 hover:text-white transition-colors" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl z-50">
              {searchResults.map(movie => (
                <button
                  key={movie.id}
                  onClick={() => handleSearchSelect(movie.id)}
                  className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors flex items-center gap-3 border-b border-zinc-800 last:border-0"
                >
                  <div className="w-8 h-8 rounded-md bg-zinc-950 flex items-center justify-center flex-shrink-0 overflow-hidden border border-zinc-800">
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt="" className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <Film className="w-4 h-4 text-zinc-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{movie.title}</div>
                    <div className="text-xs text-zinc-400">{movie.genre} · {movie.duration} mins</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav links + User */}
        <nav className="flex items-center gap-3 text-sm font-medium flex-shrink-0">
          
          {/* City Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-all text-xs font-medium"
            >
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span className="max-w-[140px] truncate">{!selectedCity || selectedCity === 'All Cities' ? 'Select your city' : selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>
          </div>

          <Link to="/movies" className="hidden md:block hover:text-white transition-colors text-zinc-400 pl-3 border-l border-zinc-800 text-xs font-medium">Movies</Link>

          {user ? (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
              >
                <div className="w-6 h-6 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center text-zinc-200">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="hidden md:block text-zinc-200 text-xs font-medium max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                  </div>
                  <div className="py-1.5">
                    <Link
                      to="/profile/bookings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white"
                    >
                      <Ticket className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-medium">My Bookings</span>
                    </Link>
                    {(user?.role === 'ADMIN' || user?.role === 'THEATRE_MANAGER') && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white"
                      >
                        <BarChart3 className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs font-medium">Admin Dashboard</span>
                      </Link>
                    )}
                    <Link
                      to="/support"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white"
                    >
                      <HeadphonesIcon className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-medium">Help & Support</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white"
                    >
                      <Settings className="w-4 h-4 text-zinc-400" />
                      <span className="text-xs font-medium">Account Settings</span>
                    </Link>
                  </div>
                  <div className="border-t border-zinc-800 py-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-xs font-medium">Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-800">
              <Link to="/login" className="hover:text-white transition-colors text-zinc-400 text-xs font-medium px-2 py-1">Login</Link>
              <Link to="/register" className="px-3.5 py-1.5 bg-white text-zinc-950 rounded-lg text-xs font-semibold hover:bg-zinc-200 transition-colors">
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
