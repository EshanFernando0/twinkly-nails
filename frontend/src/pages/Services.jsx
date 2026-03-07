import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Edit, Trash2, Clock, DollarSign, Scissors } from 'lucide-react';
import api from '../api/client';

const EMPTY = { service_name: '', description: '', price: '', duration_minutes: '60' };

export default function Services() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchServices = useCallback(async () => {
    try { const { data } = await api.get('/services'); setServices(data); } catch {}
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (s) => { setEditItem(s); setForm({ service_name: s.service_name, description: s.description || '', price: s.price, duration_minutes: s.duration_minutes }); setError(''); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      if (editItem) await api.put(`/services/${editItem.id}`, form);
      else await api.post('/services', form);
      setShowModal(false); fetchServices();
    } catch (err) { setError(err.response?.data?.error || 'Error saving service'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    await api.delete(`/services/${id}`); fetchServices();
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>Services</h2><p>{services.length} services available</p></div>
        <button id="add-service-btn" className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Service</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {services.map(s => (
          <div key={s.id} className="card" style={{ transition: 'all 0.2s', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
            <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--pink-300), var(--pink-500))' }} />
            <div className="card-body" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--pink-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Scissors size={18} style={{ color: 'var(--pink-500)' }} />
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(s)}><Edit size={13} /></button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(s.id)}><Trash2 size={13} /></button>
                </div>
              </div>
              <h3 style={{ fontSize: '15px', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '6px' }}>{s.service_name}</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--gray-400)', marginBottom: '14px', lineHeight: 1.5 }}>{s.description || 'No description'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--pink-600)' }}>Rs. {Number(s.price).toLocaleString()}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px', color: 'var(--gray-400)', marginTop: 2 }}>
                    <Clock size={12} /> {s.duration_minutes} min
                  </div>
                </div>
                {s.booking_count > 0 && (
                  <span className="badge badge-pink">{s.booking_count} bookings</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="card">
          <div className="empty-state" style={{ padding: '48px' }}>
            <div className="empty-state-icon"><Scissors size={28} /></div>
            <h3>No services added yet</h3>
            <p>Add your nail salon services to get started with bookings</p>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>{editItem ? '✏️ Edit Service' : '💅 New Service'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error"><X size={14} />{error}</div>}
                <div className="form-group">
                  <label className="form-label">Service Name *</label>
                  <input className="form-control" value={form.service_name} onChange={e => setForm({ ...form, service_name: e.target.value })} placeholder="e.g. Classic Manicure" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What does this service include?" style={{ minHeight: '70px' }} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label"><DollarSign size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Price (Rs.) *</label>
                    <input type="number" className="form-control" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" required min="0" step="0.01" />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><Clock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Duration (minutes)</label>
                    <input type="number" className="form-control" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: e.target.value })} placeholder="60" min="5" step="5" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} />Saving...</> : <>{editItem ? 'Update Service' : 'Add Service'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
