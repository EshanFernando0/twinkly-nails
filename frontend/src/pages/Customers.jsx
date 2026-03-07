import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Edit, Trash2, Search, User, Phone, FileText, Eye, ChevronLeft } from 'lucide-react';
import api from '../api/client';

const EMPTY = { full_name: '', phone_number: '', email: '', notes: '', preferred_services: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewCustomer, setViewCustomer] = useState(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const { data } = await api.get('/customers', { params: { search } });
      setCustomers(data);
    } catch {}
  }, [search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (c) => { setEditItem(c); setForm({ full_name: c.full_name, phone_number: c.phone_number || '', email: c.email || '', notes: c.notes || '', preferred_services: c.preferred_services || '' }); setError(''); setShowModal(true); };

  const openView = async (c) => {
    const { data } = await api.get(`/customers/${c.id}`);
    setViewCustomer(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (editItem) await api.put(`/customers/${editItem.id}`, form);
      else await api.post('/customers', form);
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.error || 'Error saving customer');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    await api.delete(`/customers/${id}`);
    fetchCustomers();
  };

  if (viewCustomer) return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => setViewCustomer(null)} style={{ marginBottom: '20px' }}>
        <ChevronLeft size={15} /> Back to Customers
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--pink-300), var(--pink-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 26, margin: '0 auto 16px' }}>
              {viewCustomer.full_name?.[0]?.toUpperCase()}
            </div>
            <h3 style={{ fontSize: '18px', marginBottom: 6 }}>{viewCustomer.full_name}</h3>
            <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{viewCustomer.phone_number || 'No phone'}</p>
            {viewCustomer.preferred_services && <div style={{ marginTop: 12 }}><span className="badge badge-pink">{viewCustomer.preferred_services}</span></div>}
            {viewCustomer.notes && <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: 12, fontStyle: 'italic' }}>{viewCustomer.notes}</p>}
            <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--gray-400)' }}>Member since {new Date(viewCustomer.created_at).toLocaleDateString()}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>📋 Appointment History</h3><span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{viewCustomer.appointments?.length || 0} visits</span></div>
          <div className="table-container">
            {!viewCustomer.appointments?.length ? (
              <div className="empty-state" style={{ padding: '32px' }}><h3>No appointments yet</h3></div>
            ) : (
              <table>
                <thead><tr><th>Date</th><th>Service</th><th>Status</th><th>Amount</th></tr></thead>
                <tbody>
                  {viewCustomer.appointments.map(a => (
                    <tr key={a.id}>
                      <td>{a.appointment_date}</td>
                      <td>{a.service_name || '—'}</td>
                      <td><span className={`badge ${a.status === 'completed' ? 'badge-success' : a.status === 'booked' ? 'badge-pink' : 'badge-gray'}`}>{a.status}</span></td>
                      <td>{a.price ? `Rs. ${a.price}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div><h2>Customers</h2><p>{customers.length} registered customers</p></div>
        <button id="add-customer-btn" className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Customer</button>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <Search size={15} className="search-icon" />
          <input className="search-input" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} id="customer-search" />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          {customers.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon"><User size={28} /></div><h3>No customers found</h3><p>Add your first customer to get started</p></div>
          ) : (
            <table>
              <thead>
                <tr><th>Customer</th><th>Phone</th><th>Preferred Services</th><th>Visits</th><th>Last Visit</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--pink-200), var(--pink-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          {c.full_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{c.full_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{c.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td>{c.phone_number || <span style={{ color: 'var(--gray-300)' }}>—</span>}</td>
                    <td><span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{c.preferred_services || '—'}</span></td>
                    <td><span className="badge badge-pink">{c.visit_count || 0}</span></td>
                    <td style={{ fontSize: '12.5px', color: 'var(--gray-500)' }}>{c.last_visit || 'Never'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openView(c)} title="View Profile"><Eye size={14} /></button>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(c)} title="Edit"><Edit size={14} /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(c.id)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? '✏️ Edit Customer' : '👤 New Customer'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error"><X size={14} />{error}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label"><User size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Full Name *</label>
                    <input className="form-control" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Customer name" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><Phone size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Phone Number</label>
                    <input className="form-control" value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} placeholder="077xxxxxxx" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="customer@email.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Services</label>
                  <input className="form-control" value={form.preferred_services} onChange={e => setForm({ ...form, preferred_services: e.target.value })} placeholder="e.g. Gel Polish, Manicure" />
                </div>
                <div className="form-group">
                  <label className="form-label"><FileText size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Notes</label>
                  <textarea className="form-control" rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Allergies, preferences, special notes..." style={{ minHeight: '70px' }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} />Saving...</> : <>{editItem ? 'Update Customer' : 'Add Customer'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
