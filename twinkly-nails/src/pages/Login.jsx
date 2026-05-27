import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase'; // Adjust this path if your firebase.js is somewhere else!
import logo from '../assets/Logo01.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  if (auth.currentUser) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // This talks to Firebase to verify the email and password
      await signInWithEmailAndPassword(auth, email, password);
      // If successful, send Roshi to the secret admin dashboard!
      navigate('/admin');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 flex items-center justify-center p-6 relative z-20 overflow-hidden">
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-brand-pink/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-[2rem] border border-white/60 bg-white/85 p-8 shadow-2xl shadow-brand-pink/20 backdrop-blur-xl">
        <div className="text-center mb-8">
          <img src={logo} alt="Twinkly Nails by Roshi" className="mx-auto mb-4 h-24 w-24 rounded-2xl object-cover shadow-lg shadow-brand-pink/20" />
          <h1 className="font-serif text-3xl text-brand-burgundy font-bold mb-2">Admin Login</h1>
          <p className="font-sans text-brand-burgundy/70 text-sm">Secure access for authorized personnel only.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="font-sans text-xs font-bold text-brand-burgundy uppercase tracking-wider pl-4">Admin Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/50 border border-brand-pink/50 rounded-full px-6 py-3 text-brand-burgundy focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 transition-all" 
              placeholder="owner@nailsaloon.com"
            />
          </div>

          <div className="space-y-2">
            <label className="font-sans text-xs font-bold text-brand-burgundy uppercase tracking-wider pl-4">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/50 border border-brand-pink/50 rounded-full px-6 py-3 pr-14 text-brand-burgundy focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 transition-all" 
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-4 flex items-center text-brand-burgundy/50 text-sm"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-burgundy text-white py-4 rounded-full font-sans text-sm font-bold uppercase tracking-widest hover:opacity-90 hover:shadow-lg transition-all duration-300 disabled:opacity-70"
          >
            {loading ? 'Authenticating...' : 'Secure Admin Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-brand-burgundy/50">
          Admin only. Unauthorized access is restricted.
        </p>
      </div>
    </div>
  );
};

export default Login;