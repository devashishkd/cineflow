import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate(-1); // Go back to previous page
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-4 bg-zinc-950">
      <div className="w-full max-w-md p-8 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl relative">
        <h2 className="text-2xl font-bold text-center mb-6 text-white tracking-tight">Welcome Back</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-4 text-sm"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Don't have an account? <Link to="/register" className="text-zinc-200 hover:text-white underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
