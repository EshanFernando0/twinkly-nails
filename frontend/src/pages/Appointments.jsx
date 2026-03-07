import { useState, useEffect, useCallback } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, X, Check, Trash2, Edit, Clock, User, Scissors, FileText, CheckCircle } from 'lucide-react';
import api from '../api/client';

const localizer = momentLocalizer(moment);

const EMPTY_FORM = { customer_id: '', service_id: '', appointment_date: '', appointment_time: '', notes: '', status: 'booked' };

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('month');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeAppt, setCompleteAppt] = useState(null);
  const [completeForm, setCompleteForm] = useState({ payment_method: 'cash', notes: '', amount: '' });

  const fetch = useCallback(async () => {
    try {
      const [apptRes, custRes, svcRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/customers'),
        api.get('/services')
      ]);
      setAppointments(apptRes.data);
      setCustomers(custRes.data);
      setServices(svcRes.data);
    } catch {}
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const calEvents = appointments.map(a => ({
    id: a.id,
    title: `${a.appointment_time} - ${a.customer_name || 'Walk-in'} (${a.service_name || 'Service'})`,
    start: new Date(`${a.appointment_date}T${a.appointment_time}`),
    end: new Date(`${a.appointment_date}T${a.appointment_time}`),
    resource: a,
    className: a.status,
  }));

  const openAdd = (slotInfo) => {
    const date = slotInfo?.start ? moment(slotInfo.start).format('YYYY-MM-DD') : '';
    const time = slotInfo?.start ? moment(slotInfo.start).format('HH:mm') : '';
    setEditItem(null);
    setForm({ ...EMPTY_FORM, appointment_date: date, appointment_time: time || '09:00' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (appt) => {
    setEditItem(appt);
    setForm({
      customer_id: appt.customer_id || '',
      service_id: appt.service_id || '',
      appointment_date: appt.appointment_date,
      appointment_time: appt.appointment_time,
      notes: appt.notes || '',
      status: appt.status
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editItem) {
        await api.put(`/appointments/${editItem.id}`, form);
      } else {
        await api.post('/appointments', form);
      }
      setShowModal(false);
      fetch();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    await api.delete(`/appointments/${id}`);
    fetch();
  };

  const openCompleteModal = (appt) => {
    setCompleteAppt(appt);
    setCompleteForm({ payment_method: 'cash', notes: '', amount: appt.price || '' });
    setShowCompleteModal(true);
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/appointments/${completeAppt.id}/complete`, completeForm);
      setShowCompleteModal(false);
      fetch();
    } catch (err) {
      setError(err.response?.data?.error || 'Error completing appointment');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    const map = { booked: 'badge-pink', completed: 'badge-success', cancelled: 'badge-gray' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
  };

  const eventStyleGetter = (event) => {
    const colors = {
      booked: { background: 'linear-gradient(135deg, #ff9dbe, #f43f7b)', border: 'none' },
      completed: { background: 'linear-gradient(135deg, #6ee7b7, #16a34a)', border: 'none' },
      cancelled: { background: 'linear-gradient(135deg, #d4d4d8, #71717a)', border: 'none' },
    };
    return { style: { ...colors[event.resource?.status], borderRadius: '6px', color: 'white', padding: '2px 6px', fontSize: '11px' } };
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Appointments</h2>
          <p>Click on a date to book, or click an appointment to edit</p>
        </div>
        <button id="add-appointment-btn" className="btn btn-primary" onClick={() => openAdd(null)}>
          <Plus size={16} /> New Appointment
        </button>
      </div>

      {/* Calendar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body" style={{ padding: '16px' }}>
          <BigCalendar
            localizer={localizer}
            events={calEvents}
            view={view}
            onView={setView}
            style={{ height: 500 }}
            selectable
            onSelectSlot={openAdd}
            onSelectEvent={(e) => openEdit(e.resource)}
            eventPropGetter={eventStyleGetter}
            popup
            views={['month', 'week', 'day']}
          />
        </div>
      </div>

      {/* Appointment List */}
      <div className="card">
        <div className="card-header">
          <h3>All Appointments</h3>
          <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{appointments.length} total</span>
        </div>
        <div className="table-container">
          {appointments.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon"><Clock size={28} /></div><h3>No appointments yet</h3><p>Add your first appointment above</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice().reverse().map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.appointment_date}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{a.appointment_time}</div>
                    </td>
                    <td>{a.customer_name || <span style={{ color: 'var(--gray-400)' }}>Walk-in</span>}</td>
                    <td>{a.service_name ? <span>{a.service_name}</span> : '—'}</td>
                    <td>{statusBadge(a.status)}</td>
                    <td style={{ fontSize: '12px', color: 'var(--gray-400)', maxWidth: '150px' }}>{a.notes || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {a.status === 'booked' && (
                          <button className="btn btn-success btn-sm btn-icon" title="Complete & Record Income" onClick={() => openCompleteModal(a)}>
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(a)} title="Edit">
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(a.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? '✏️ Edit Appointment' : '📅 New Appointment'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error"><X size={14} />{error}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label"><User size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Customer</label>
                    <select className="form-control" value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
                      <option value="">Walk-in customer</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label"><Scissors size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Service</label>
                    <select className="form-control" value={form.service_id} onChange={e => setForm({ ...form, service_id: e.target.value })}>
                      <option value="">Select service</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.service_name} - Rs. {s.price}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" value={form.appointment_date} onChange={e => setForm({ ...form, appointment_date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><Clock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Time</label>
                    <input type="time" className="form-control" value={form.appointment_time} onChange={e => setForm({ ...form, appointment_time: e.target.value })} required />
                  </div>
                </div>
                {editItem && (
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      <option value="booked">Booked</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label"><FileText size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Notes</label>
                  <textarea className="form-control" rows="2" placeholder="Any special requests or notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ minHeight: '70px' }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} />Saving...</> : <><Check size={14} />{editItem ? 'Update' : 'Book Appointment'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete & Record Income Modal */}
      {showCompleteModal && (
        <div className="modal-overlay" onClick={() => setShowCompleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>✅ Complete Appointment</h3>
              <button className="modal-close" onClick={() => setShowCompleteModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleComplete}>
              <div className="modal-body">
                <div className="alert alert-info" style={{ marginBottom: '16px' }}>
                  <CheckCircle size={16} />
                  This will mark the appointment as completed and record the income automatically.
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (Rs.)</label>
                  <input type="number" className="form-control" value={completeForm.amount} onChange={e => setCompleteForm({ ...completeForm, amount: e.target.value })} placeholder="Enter amount received" required step="0.01" />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-control" value={completeForm.payment_method} onChange={e => setCompleteForm({ ...completeForm, payment_method: e.target.value })}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes (optional)</label>
                  <input type="text" className="form-control" value={completeForm.notes} onChange={e => setCompleteForm({ ...completeForm, notes: e.target.value })} placeholder="Any notes..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCompleteModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={loading}>
                  <CheckCircle size={14} /> Complete & Record Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
