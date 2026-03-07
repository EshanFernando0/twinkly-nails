import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, X, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function TopBar({ pageTitle, pageSubtitle, onToggleSidebar, sidebarOpen }) {
  const { user } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef();

  useEffect(() => {
    api.get('/notifications').then(r => setNotifications(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter(n => n.status === 'unread').length;

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
    } catch {}
  };

  const fmt = (dt) => {
    const d = new Date(dt), now = new Date(), diff = (now - d) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SO';

  // Page title icons
  const pageIcons = {
    'Dashboard': '🏠',
    'Appointments': '📅',
    'Customers': '👩‍💅',
    'Services': '💅',
    'Income': '💰',
    'Expenses': '🧾',
    'Inventory': '📦',
    'Reports': '📊',
    'Settings': '⚙️',
  };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="topbar-btn mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
          style={{ display: 'flex' }}
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
        <div className="topbar-left">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 18 }}>{pageIcons[pageTitle] || '✨'}</span>
            {pageTitle}
          </h1>
          {pageSubtitle && <p>{pageSubtitle}</p>}
        </div>
      </div>

      <div className="topbar-right">
        {/* Cute brand tagline */}
        <div style={{ display: 'none', alignItems: 'center', gap: 6, padding: '5px 14px', background: 'var(--blush-50)', borderRadius: 99, border: '1px solid var(--blush-100)' }} className="topbar-brand-tag">
          <span style={{ fontFamily: 'Pacifico, cursive', fontSize: 13, color: 'var(--rose-600)' }}>Twinkly</span>
          <span style={{ fontSize: 12 }}>💅</span>
        </div>

        {/* Notifications */}
        <div className="dropdown" ref={notifRef}>
          <button
            className="topbar-btn"
            onClick={() => setShowNotifs(!showNotifs)}
            aria-label="Notifications"
            id="notif-btn"
          >
            <Bell size={16} />
            {unread > 0 && <span className="badge">{unread > 9 ? '9+' : unread}</span>}
          </button>

          {showNotifs && (
            <div className="notification-panel">
              <div className="notification-panel-header">
                <h4>
                  🔔 Notifications
                  {unread > 0 && <span className="badge badge-pink" style={{ marginLeft: 6 }}>{unread} new</span>}
                </h4>
                {unread > 0 && (
                  <button className="btn btn-ghost btn-xs" onClick={markAllRead}>
                    <Check size={10} /> All read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🎉</div>
                  <p style={{ fontSize: 12.5, color: 'var(--mauve-300)', fontFamily: 'DM Sans, sans-serif' }}>All caught up!</p>
                </div>
              ) : (
                notifications.slice(0, 8).map(n => (
                  <div key={n.id} className={`notification-item ${n.status}`}>
                    <div className="notification-item-title">
                      {n.type === 'low_stock' ? '📦' : n.type === 'appointment_completed' ? '✅' : '🔔'} {n.title}
                    </div>
                    <div className="notification-item-msg">{n.message}</div>
                    <div className="notification-item-time">{fmt(n.created_at)}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="topbar-avatar" title={user?.full_name}>{initials}</div>
      </div>
    </header>
  );
}
