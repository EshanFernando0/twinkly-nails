import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Edit, Trash2, TrendingDown } from 'lucide-react';
import api from '../api/client';

const CATEGORIES = ['Rent', 'Utilities', 'Nail Products', 'Tools', 'Transport', 'Cleaning Supplies', 'Miscellaneous'];
const EMPTY = { date: new Date().toISOString().split('T')[0], category: '', amount: '', supplier: '', notes: '' };

export default function Expenses() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ monthly: 0, byCategory: [] });
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), category: '' });

  const fetchData = useCallback(async () => {
    try {
      const [recRes, sumRes] = await Promise.all([
        api.get('/expenses', { params: filter }),
        api.get('/expenses/summary')
      ]);
      setRecords(recRes.data);
      setSummary(sumRes.data);
    } catch {}
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (r) => { setEditItem(r); setForm({ date: r.date, category: r.category, amount: r.amount, supplier: r.supplier || '', notes: r.notes || '' }); setError(''); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      if (editItem) await api.put(`/expenses/${editItem.id}`, form);
      else await api.post('/expenses', form);
      setShowModal(false); fetchData();
    } catch (err) { setError(err.response?.data?.error || 'Error saving expense'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    await api.delete(`/expenses/${id}`); fetchData();
  };

  const fmtMoney = (n) => `Rs. ${Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
  const totalShown = records.reduce((s, r) => s + r.amount, 0);
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const catColors = {
    'Rent': 'badge-danger', 'Utilities': 'badge-warning', 'Nail Products': 'badge-pink',
    'Tools': 'badge-purple', 'Transport': 'badge-info', 'Cleaning Supplies': 'badge-success', 'Miscellaneous': 'badge-gray'
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>Expenses</h2><p>Track all your business costs</p></div>
        <button id="add-expense-btn" className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Expense</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '24px' }}>
        <div className="stat-card red">
          <div className="stat-icon red"><TrendingDown size={20} /></div>
          <div className="stat-label">This Month Total</div>
          <div className="stat-value" style={{ fontSize: '20px' }}>{fmtMoney(summary.monthly)}</div>
          <div className="stat-sub">Monthly expenses</div>
        </div>

        <div className="card">
          <div className="card-header" style={{ padding: '14px 20px' }}><h3 style={{ fontSize: '14px' }}>By Category (This Month)</h3></div>
          <div style={{ padding: '12px 20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {summary.byCategory?.length === 0 ? (
              <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>No expenses this month</span>
            ) : summary.byCategory.map(cat => (
              <div key={cat.category} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--nude-50)', borderRadius: '8px', padding: '6px 12px' }}>
                <span className={`badge ${catColors[cat.category] || 'badge-gray'}`}>{cat.category}</span>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{fmtMoney(cat.total)}</span>
              </div>
            ))}
          </div>
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
        <select className="form-control" style={{ maxWidth: '170px' }} value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Expense Records</h3>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>Total: {fmtMoney(totalShown)}</div>
        </div>
        <div className="table-container">
          {records.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon"><TrendingDown size={28} /></div><h3>No expenses recorded</h3><p>Track your business expenses to monitor costs accurately</p></div>
          ) : (
            <table>
              <thead><tr><th>Date</th><th>Category</th><th>Supplier</th><th>Notes</th><th style={{ textAlign: 'right' }}>Amount</th><th>Actions</th></tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{r.date}</td>
                    <td><span className={`badge ${catColors[r.category] || 'badge-gray'}`}>{r.category}</span></td>
                    <td>{r.supplier || <span style={{ color: 'var(--gray-300)' }}>—</span>}</td>
                    <td style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{r.notes || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626', fontSize: '14px' }}>{fmtMoney(r.amount)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(r)}><Edit size={13} /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(r.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#fff1f2' }}>
                  <td colSpan={4} style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--gray-700)' }}>Total for selected period</td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626', fontSize: '15px', padding: '12px 16px' }}>{fmtMoney(totalShown)}</td>
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
              <h3>{editItem ? '✏️ Edit Expense' : '💸 Add Expense'}</h3>
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
                    <label className="form-label">Category *</label>
                    <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Supplier</label>
                    <input className="form-control" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-control" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <>{editItem ? 'Update' : 'Add Expense'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
