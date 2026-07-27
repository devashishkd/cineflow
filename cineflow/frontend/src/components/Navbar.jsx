import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="px-8 py-4 border-b border-white/10 backdrop-blur-md sticky top-0 z-50 bg-obsidian/80">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 group">
          <Film className="w-8 h-8 text-neonTeal group-hover:text-neonPurple transition-colors duration-300" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-neonPurple to-neonTeal bg-clip-text text-transparent">
            Cineflow
          </h1>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link to="/" className="hover:text-neonTeal transition-colors">Movies</Link>
          
          {user ? (
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-white/10">
              <div className="flex items-center space-x-2 text-white/80">
                <User className="w-4 h-4" />
                <span>{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 text-white/50 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-white/10">
              <Link to="/login" className="hover:text-neonPurple transition-colors">Login</Link>
              <Link to="/register" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/5">
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
