import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase'; // Adjust this path if your firebase.js is somewhere else!

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 to-rose-100 flex items-center justify-center p-6 relative z-20">
      
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] p-10 max-w-md w-full shadow-2xl shadow-brand-pink/40">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-brand-burgundy font-bold mb-2">Admin Portal</h1>
          <p className="font-sans text-brand-burgundy/70 text-sm">Authorized personnel only.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="font-sans text-xs font-bold text-brand-burgundy uppercase tracking-wider pl-4">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/50 border border-brand-pink/50 rounded-full px-6 py-3 text-brand-burgundy focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 transition-all" 
              placeholder="roshi@twinklynails.com"
            />
          </div>

          <div className="space-y-2">
            <label className="font-sans text-xs font-bold text-brand-burgundy uppercase tracking-wider pl-4">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/50 border border-brand-pink/50 rounded-full px-6 py-3 text-brand-burgundy focus:outline-none focus:ring-2 focus:ring-brand-burgundy/30 transition-all" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-burgundy text-white py-4 rounded-full font-sans text-sm font-bold uppercase tracking-widest hover:opacity-90 hover:shadow-lg transition-all duration-300 disabled:opacity-70"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;