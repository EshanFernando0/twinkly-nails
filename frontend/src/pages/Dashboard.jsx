import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? '🌸 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening';
  const todayStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    api.get('/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 0 })}`;
  const statusBadge = (s) => {
    const m = { booked: 'badge-pink', completed: 'badge-success', cancelled: 'badge-gray' };
    const icons = { booked: '🕐', completed: '✅', cancelled: '❌' };
    return <span className={`badge ${m[s] || 'badge-gray'}`}>{icons[s]}{s}</span>;
  };

  if (loading) return (
    <div className="loading-page">
      <div style={{ fontSize: 40, animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>🌸</div>
      <span style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--mauve-300)', fontWeight: 500 }}>Loading your beautiful dashboard...</span>
    </div>
  );

  return (
    <div>
      {/* ── Hero Welcome Banner ── */}
      <div style={{
        borderRadius: 'var(--r-xl)', marginBottom: 24, overflow: 'hidden',
        boxShadow: 'var(--shadow-md)', position: 'relative',
        background: 'linear-gradient(135deg, #c95c7b 0%, #8a2a48 100%)',
        minHeight: 140,
      }}>
        {/* Hero image overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/nail-hero.png)',
          backgroundSize: 'cover', backgroundPosition: 'center right',
          opacity: .22,
        }} />
        {/* Decorative petals */}
        <div style={{ position: 'absolute', top: 12, left: 180, fontSize: 28, opacity: .3 }}>🌸</div>
        <div style={{ position: 'absolute', top: 8, right: 260, fontSize: 20, opacity: .25 }}>✨</div>
        <div style={{ position: 'absolute', bottom: 14, left: 300, fontSize: 22, opacity: .2 }}>💕</div>
        <div style={{ position: 'absolute', top: 20, right: 160, fontSize: 24, opacity: .2 }}>🌷</div>

        <div style={{
          position: 'relative', zIndex: 1,
          padding: '24px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <img src="/twinkly-logo.png" alt="" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 12, background: 'rgba(255,255,255,.18)', padding: 4 }} onError={e => e.target.style.display='none'} />
              <div>
                <div style={{ fontFamily: 'Pacifico, cursive', fontSize: 22, color: '#fff', letterSpacing: '.02em' }}>Twinkly Nails</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', fontFamily: 'DM Sans, sans-serif', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 1 }}>by Roshi</div>
              </div>
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#fff', fontWeight: 600, marginBottom: 3 }}>
              {greeting}, {user?.full_name?.split(' ')[0] || 'Roshi'} 💅
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', fontFamily: 'DM Sans, sans-serif' }}>{todayStr}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn"
              style={{ background: 'rgba(255,255,255,.20)', color: '#fff', border: '1px solid rgba(255,255,255,.30)', backdropFilter: 'blur(10px)', fontFamily: 'DM Sans, sans-serif' }}
              onClick={() => navigate('/appointments')}
            >
              📅 New Appointment
            </button>
            <button
              className="btn"
              style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.20)', backdropFilter: 'blur(10px)', fontFamily: 'DM Sans, sans-serif' }}
              onClick={() => navigate('/income')}
            >
              💰 Add Income
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI STAT CARDS ── */}
      <div className="stat-cards-grid">
        {[
          { emoji:'📅', label:"Today's Appointments", value: data?.today_appointments?.length||0, sub:`${data?.month_appointments_count||0} this month`, cls:'', to:'/appointments' },
          { emoji:'💰', label:'Monthly Income',        value: fmt(data?.monthly_income),  sub:'This month', cls:'green', to:'/income' },
          { emoji:'🧾', label:'Monthly Expenses',      value: fmt(data?.monthly_expenses), sub:'This month', cls:'red', to:'/expenses' },
          { emoji:'💎', label:'Net Profit',             value: fmt(data?.net_profit),       sub:'This month', cls:'purple', to:'/reports', valueColor:(data?.net_profit||0)>=0?'var(--success)':'var(--danger)' },
          { emoji:'📦', label:'Low Stock Items',        value: data?.low_stock_count||0, sub:'Need restocking', cls:'orange', to:'/inventory', valueColor:(data?.low_stock_count||0)>0?'var(--danger)':undefined },
          { emoji:'👩‍💅', label:'Total Customers',       value: data?.total_customers||0, sub:'Registered', cls:'blue', to:'/customers' },
        ].map(c => (
          <div key={c.label} className={`stat-card ${c.cls}`} style={{ cursor: 'pointer' }} onClick={() => navigate(c.to)}>
            <div className="stat-card-deco">{c.emoji}</div>
            <div className="stat-icon" style={{ fontSize: 22 }}>{c.emoji}</div>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value" style={{ color: c.valueColor || 'var(--warm-600)' }}>{c.value}</div>
            <div className="stat-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '18px' }}>

        {/* ──── LEFT COL ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Today's Schedule */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, var(--blush-100), var(--blush-200))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📅</div>
                <div>
                  <h3>Today's Schedule</h3>
                  <p style={{ fontSize: 11.5, color: 'var(--mauve-300)', marginTop: 1, fontFamily: 'DM Sans, sans-serif' }}>{todayStr}</p>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/appointments')}>View all →</button>
            </div>
            {!data?.today_appointments?.length ? (
              <div className="empty-state">
                <div className="empty-state-icon" style={{ fontSize: 28 }}>🌸</div>
                <h3>Nothing scheduled today</h3>
                <p>Enjoy your day or add a new appointment</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/appointments')}>
                  📅 Book Now
                </button>
              </div>
            ) : (
              data.today_appointments.map((a, i) => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 22px',
                  borderBottom: i < data.today_appointments.length-1 ? '1px solid var(--blush-50)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: 'linear-gradient(135deg, var(--blush-200), var(--rose-400))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0,
                      fontFamily: 'DM Sans, sans-serif',
                      boxShadow: '0 3px 10px rgba(232,68,118,.2)'
                    }}>
                      {a.customer_name?.[0]?.toUpperCase() || '👩'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--warm-600)', fontFamily: 'DM Sans, sans-serif' }}>{a.customer_name || 'Walk-in'}</div>
                      <div style={{ fontSize: 12, color: 'var(--mauve-300)', marginTop: 2, fontFamily: 'DM Sans, sans-serif' }}>💅 {a.service_name || 'Nail Service'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--rose-600)' }}>🕐 {a.appointment_time}</div>
                    {statusBadge(a.status)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Income */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💰</div>
                <h3>Recent Income</h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/income')}>View all →</button>
            </div>
            {!data?.recent_income?.length ? (
              <div className="empty-state">
                <div className="empty-state-icon" style={{ fontSize: 26 }}>💸</div>
                <h3>No income yet</h3>
                <p>Complete appointments to start tracking earnings</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Customer</th><th>Service</th><th>Method</th><th style={{ textAlign: 'right' }}>Amount</th></tr>
                  </thead>
                  <tbody>
                    {data.recent_income.map(r => (
                      <tr key={r.id}>
                        <td style={{ color: 'var(--mauve-300)', fontSize: 12.5 }}>{r.date}</td>
                        <td style={{ fontWeight: 600 }}>{r.customer_name || 'Walk-in'}</td>
                        <td style={{ color: 'var(--mauve-300)', fontSize: 13 }}>💅 {r.service_name || '—'}</td>
                        <td>
                          <span className={`badge ${r.payment_method==='cash'?'badge-success':r.payment_method==='card'?'badge-info':'badge-mauve'}`}>
                            {r.payment_method==='cash'?'💵':r.payment_method==='card'?'💳':'🏦'} {r.payment_method}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--success)', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{fmt(r.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ──── RIGHT COL ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Upcoming Bookings */}
          <div className="card">
            <div className="card-header">
              <h3>🗓 Upcoming Bookings</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/appointments')}>All</button>
            </div>
            {!data?.upcoming_appointments?.length ? (
              <div style={{ padding: '22px', textAlign: 'center' }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>✅</div>
                <p style={{ fontSize: 13, color: 'var(--mauve-300)', fontFamily: 'DM Sans, sans-serif' }}>No upcoming bookings</p>
              </div>
            ) : (
              data.upcoming_appointments.map(a => (
                <div key={a.id} className="mini-list-item">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--warm-600)', fontFamily: 'DM Sans, sans-serif' }}>{a.customer_name || 'Walk-in'}</div>
                    <div style={{ fontSize: 12, color: 'var(--mauve-300)', marginTop: 2, fontFamily: 'DM Sans, sans-serif' }}>💅 {a.service_name || 'Service'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose-600)', fontFamily: 'DM Sans, sans-serif' }}>{a.appointment_date}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--mauve-300)', fontFamily: 'DM Sans, sans-serif' }}>🕐 {a.appointment_time}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Stock Alerts */}
          <div className="card">
            <div className="card-header">
              <h3>📦 Stock Alerts</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/inventory')}>Manage</button>
            </div>
            {!data?.low_stock_items?.length ? (
              <div style={{ padding: '22px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>All stocked up!</p>
              </div>
            ) : (
              data.low_stock_items.slice(0, 5).map(item => (
                <div key={item.id} className="mini-list-item">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--warm-600)', fontFamily: 'DM Sans, sans-serif' }}>
                      {item.quantity === 0 ? '🚨' : '⚠️'} {item.product_name}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--mauve-300)', fontFamily: 'DM Sans, sans-serif' }}>{item.category}</div>
                  </div>
                  <span className={`badge ${item.quantity===0?'badge-danger':'badge-warning'}`}>
                    {item.quantity} / {item.minimum_stock_level}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header"><h3>⚡️ Quick Actions</h3></div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { emoji: '📅', label: 'New Appointment', to: '/appointments', color: 'var(--rose-600)' },
                { emoji: '💰', label: 'Record Income',    to: '/income',       color: 'var(--success)' },
                { emoji: '🧾', label: 'Add Expense',      to: '/expenses',     color: 'var(--danger)' },
                { emoji: '👩‍💅', label: 'New Customer',    to: '/customers',    color: 'var(--mauve-500)' },
                { emoji: '📊', label: 'View Reports',     to: '/reports',      color: '#7c3aed' },
              ].map(q => (
                <button
                  key={q.to}
                  onClick={() => navigate(q.to)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 10,
                    background: 'var(--cream-100)', border: '1px solid var(--blush-100)',
                    cursor: 'pointer', transition: 'all .2s',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
                    color: 'var(--warm-500)', textAlign: 'left', width: '100%'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='var(--blush-50)'; e.currentTarget.style.color=q.color; e.currentTarget.style.borderColor='var(--blush-200)'; e.currentTarget.style.transform='translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='var(--cream-100)'; e.currentTarget.style.color='var(--warm-500)'; e.currentTarget.style.borderColor='var(--blush-100)'; e.currentTarget.style.transform=''; }}
                >
                  <span style={{ fontSize: 18 }}>{q.emoji}</span>
                  {q.label}
                  <span style={{ marginLeft: 'auto', color: 'var(--mauve-200)', fontSize: 14 }}>›</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ marginTop: 28, textAlign: 'center', padding: '16px', borderTop: '1px solid var(--blush-100)' }}>
        <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: 16, color: 'var(--mauve-300)' }}>
          ✨ Twinkly Nails by Roshi — Made with 💕 for beautiful nails ✨
        </p>
      </div>
    </div>
  );
}
