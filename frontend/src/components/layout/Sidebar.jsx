import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard',    emoji: '🏠' },
  { to: '/appointments', label: 'Appointments', emoji: '📅' },
  { to: '/customers',   label: 'Customers',    emoji: '👩‍💅' },
  { to: '/services',    label: 'Services',     emoji: '💅' },
  { to: '/income',      label: 'Income',       emoji: '💰' },
  { to: '/expenses',    label: 'Expenses',     emoji: '🧾' },
  { to: '/inventory',   label: 'Inventory',    emoji: '📦' },
  { to: '/reports',     label: 'Reports',      emoji: '📊' },
  { to: '/settings',    label: 'Settings',     emoji: '⚙️' },
];

export default function Sidebar({ open, onClose, lowStockCount }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SO';

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'active' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>

        {/* ── Logo ── */}
        <div className="sidebar-logo">
          <img
            src="/twinkly-logo.png"
            alt="Twinkly Nails by Roshi"
            className="sidebar-logo-img"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div className="sidebar-logo-name">Twinkly</div>
          <div className="sidebar-logo-sub">✨ Nails by Roshi ✨</div>
        </div>

        {/* ── Navigation ── */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation</div>
          {navItems.map(({ to, label, emoji }) => {
            const isActive = to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-icon-wrap">{emoji}</span>
                {label}
                {label === 'Inventory' && lowStockCount > 0 && (
                  <span className="nav-badge">{lowStockCount}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── User + Logout ── */}
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div>
              <div className="sidebar-user-name">{user?.full_name || 'Salon Owner'}</div>
              <div className="sidebar-user-sub">💅 Salon Owner</div>
            </div>
          </div>
          <button
            className="nav-item"
            onClick={logout}
            style={{ color: '#e11d48', marginTop: '4px' }}
          >
            <span className="nav-icon-wrap" style={{ background: '#fff1f2', color: '#e11d48' }}>🚪</span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
