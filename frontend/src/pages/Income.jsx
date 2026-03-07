import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Edit, Trash2, TrendingUp } from 'lucide-react';
import api from '../api/client';

const EMPTY = { date: new Date().toISOString().split('T')[0], amount: '', payment_method: 'cash', customer_id: '', service_id: '', notes: '' };
const PAYMENT_METHODS = ['cash', 'card', 'transfer'];

export default function Income() {
  const [records, setRecords] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [summary, setSummary] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), payment_method: '' });

  const fetchData = useCallback(async () => {
    try {
      const [recRes, sumRes, custRes, svcRes] = await Promise.all([
        api.get('/income', { params: filter }),
        api.get('/income/summary'),
        api.get('/customers'),
        api.get('/services')
      ]);
      setRecords(recRes.data);
      setSummary(sumRes.data);
      setCustomers(custRes.data);
      setServices(svcRes.data);
    } catch {}
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (r) => { setEditItem(r); setForm({ date: r.date, amount: r.amount, payment_method: r.payment_method, customer_id: r.customer_id || '', service_id: r.service_id || '', notes: r.notes || '' }); setError(''); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      if (editItem) await api.put(`/income/${editItem.id}`, form);
      else await api.post('/income', form);
      setShowModal(false); fetchData();
    } catch (err) { setError(err.response?.data?.error || 'Error saving record'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income record?')) return;
    await api.delete(`/income/${id}`); fetchData();
  };

  const fmtMoney = (n) => `Rs. ${Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
  const totalShown = records.reduce((s, r) => s + r.amount, 0);

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div>
      <div className="page-header">
        <div><h2>Income</h2><p>Track all your earnings</p></div>
        <button id="add-income-btn" className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Income</button>
      </div>

      <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
        <div className="stat-card green">
          <div className="stat-icon green"><TrendingUp size={20} /></div>
          <div className="stat-label">Today's Income</div>
          <div className="stat-value" style={{ fontSize: '18px' }}>{fmtMoney(summary.daily)}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><TrendingUp size={20} /></div>
          <div className="stat-label">This Week</div>
          <div className="stat-value" style={{ fontSize: '18px' }}>{fmtMoney(summary.weekly)}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><TrendingUp size={20} /></div>
          <div className="stat-label">This Month</div>
          <div className="stat-value" style={{ fontSize: '18px' }}>{fmtMoney(summary.monthly)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="search-bar" style={{ marginBottom: '16px' }}>
        <select className="form-control" style={{ maxWidth: '100px' }} value={filter.month} onChange={e => setFilter({ ...filter, month: e.target.value })}>
          {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
        <select className="form-control" style={{ maxWidth: '90px' }} value={filter.year} onChange={e => setFilter({ ...filter, year: e.target.value })}>
          {[2023,2024,2025,2026].map(y => <option key={y}>{y}</option>)}
        </select>
        <select className="form-control" style={{ maxWidth: '130px' }} value={filter.payment_method} onChange={e => setFilter({ ...filter, payment_method: e.target.value })}>
          <option value="">All Methods</option>
          {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Income Records</h3>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>Total: {fmtMoney(totalShown)}</div>
        </div>
        <div className="table-container">
          {records.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon"><TrendingUp size={28} /></div><h3>No income records</h3><p>Add income records or complete appointments to track earnings</p></div>
          ) : (
            <table>
              <thead><tr><th>Date</th><th>Customer</th><th>Service</th><th>Method</th><th>Notes</th><th style={{ textAlign: 'right' }}>Amount</th><th>Actions</th></tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{r.date}</td>
                    <td>{r.customer_name || <span style={{ color: 'var(--gray-300)' }}>Walk-in</span>}</td>
                    <td>{r.service_name || '—'}</td>
                    <td><span className={`badge ${r.payment_method === 'cash' ? 'badge-success' : r.payment_method === 'card' ? 'badge-info' : 'badge-purple'}`}>{r.payment_method}</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{r.notes || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a', fontSize: '14px' }}>{fmtMoney(r.amount)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(r)}><Edit size={13} /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(r.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--pink-50)' }}>
                  <td colSpan={5} style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--gray-700)' }}>Total for selected period</td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: '#16a34a', fontSize: '15px', padding: '12px 16px' }}>{fmtMoney(totalShown)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editItem ? '✏️ Edit Income' : '💰 Add Income'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error"><X size={14} />{error}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (Rs.) *</label>
                    <input type="number" className="form-control" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required min="0" step="0.01" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Customer</label>
                    <select className="form-control" value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
                      <option value="">Walk-in / None</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Service</label>
                    <select className="form-control" value={form.service_id} onChange={e => setForm({ ...form, service_id: e.target.value })}>
                      <option value="">None</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-control" value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}>
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-control" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any notes..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <>{editItem ? 'Update' : 'Add Income'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
