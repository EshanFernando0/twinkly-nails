import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('owner@nailsaloon.com');
  const [password, setPassword] = useState('saloon123');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const r = await login(email, password);
    if (!r.success) setError(r.error);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(145deg, #fdf8f2 0%, #fde8ed 40%, #f5e8ef 70%, #fdf8f2 100%)',
      position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'center'
    }}>
      {/* Floating decorations */}
      {['🌸','✨','💅','🌷','💕','⭐','🌺','💗'].map((e, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${[5,15,75,85,25,65,45,90][i]}%`,
          top: `${[10,70,15,60,45,20,80,35][i]}%`,
          fontSize: `${[24,20,28,18,22,18,24,20][i]}px`,
          opacity: .12 + (i % 3) * .04,
          animation: `float ${4 + i}s ease-in-out infinite`,
          animationDelay: `${i * .5}s`,
          pointerEvents: 'none'
        }}>{e}</div>
      ))}
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(8deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Main card */}
      <div style={{
        width: '100%', maxWidth: 420, position: 'relative', zIndex: 1,
        padding: '20px'
      }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
            <img
              src="/twinkly-logo.png"
              alt="Twinkly Nails by Roshi"
              style={{
                width: 130, height: 130, objectFit: 'contain',
                filter: 'drop-shadow(0 8px 24px rgba(168,64,96,.28))',
                animation: 'float 5s ease-in-out infinite'
              }}
              onError={e => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div style={{
            fontFamily: 'Pacifico, cursive', fontSize: 32, color: 'var(--rose-600)',
            letterSpacing: '.02em', lineHeight: 1, marginBottom: 4,
          }}>Twinkly</div>
          <div style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '.16em',
            color: 'var(--mauve-300)', marginBottom: 8
          }}>✨ NAILS BY ROSHI ✨</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: 'var(--warm-400)', fontStyle: 'italic' }}>
            Welcome back, gorgeous! 💅
          </div>
        </div>

        {/* Form card */}
        <div style={{
          background: 'rgba(255,255,255,.90)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 28, border: '1px solid rgba(248,152,174,.3)',
          boxShadow: '0 24px 64px rgba(168,64,96,.16), 0 4px 16px rgba(0,0,0,.06)',
          padding: '32px 28px',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Top shimmer accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--blush-200), var(--rose-500), var(--mauve-300), var(--rose-500), var(--blush-200))', backgroundSize: '200% auto', animation: 'shimmer 3s linear infinite' }} />

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 18 }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span style={{ fontFamily: 'DM Sans, sans-serif' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>📧</span> Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-email"
                  type="email"
                  className="form-control"
                  placeholder="owner@nailsaloon.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={{ paddingLeft: 14 }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>🔒</span> Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 10, top: '50%',
                    transform: 'translateY(-50%)', background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--mauve-300)', padding: 4,
                    display: 'flex', alignItems: 'center',
                    transition: 'color .18s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--rose-500)'}
                  onMouseLeave={e => e.currentTarget.style.color='var(--mauve-300)'}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', border: 'none', borderRadius: 14,
                background: 'linear-gradient(135deg, var(--blush-400), var(--rose-600))',
                color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-rose)',
                transition: 'all .22s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? .7 : 1,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(232,68,118,.45)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='var(--shadow-rose)'; }}
            >
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,.3)', borderTopColor: '#fff' }} /> Signing in...</>
              ) : (
                <>✨ Sign In to Dashboard</>
              )}
            </button>
          </form>
        </div>

        {/* Credentials hint */}
        <div style={{
          textAlign: 'center', marginTop: 16, padding: '10px 16px',
          background: 'rgba(255,255,255,.6)', borderRadius: 12,
          border: '1px solid rgba(248,152,174,.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11.5, color: 'var(--mauve-300)' }}>
            Demo: <span style={{ fontWeight: 700, color: 'var(--rose-600)' }}>owner@nailsaloon.com</span> / <span style={{ fontWeight: 700, color: 'var(--rose-600)' }}>saloon123</span>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: 15, color: 'var(--mauve-300)' }}>
            Made with 💕 for Twinkly Nails
          </p>
        </div>
      </div>
    </div>
  );
}
