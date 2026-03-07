import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Edit, Trash2, AlertTriangle, Package, Search } from 'lucide-react';
import api from '../api/client';

const CATEGORIES = ['Nail Polish', 'Gel Products', 'Removers', 'Tools', 'Supplies', 'Decorations', 'Cleaning', 'Other'];
const EMPTY = { product_name: '', category: '', quantity: '', minimum_stock_level: '5', purchase_price: '', supplier: '', notes: '' };

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [showQtyModal, setShowQtyModal] = useState(null);
  const [newQty, setNewQty] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      const params = {};
      if (filterLowStock) params.low_stock = 'true';
      const { data } = await api.get('/inventory', { params });
      setItems(data);
    } catch {}
  }, [filterLowStock]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (i) => {
    setEditItem(i);
    setForm({ product_name: i.product_name, category: i.category || '', quantity: i.quantity, minimum_stock_level: i.minimum_stock_level, purchase_price: i.purchase_price || '', supplier: i.supplier || '', notes: i.notes || '' });
    setError(''); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      if (editItem) await api.put(`/inventory/${editItem.id}`, form);
      else await api.post('/inventory', form);
      setShowModal(false); fetchItems();
    } catch (err) { setError(err.response?.data?.error || 'Error saving item'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inventory item?')) return;
    await api.delete(`/inventory/${id}`); fetchItems();
  };

  const handleQtyUpdate = async (item) => {
    setShowQtyModal(item);
    setNewQty(item.quantity);
  };

  const saveQty = async () => {
    await api.patch(`/inventory/${showQtyModal.id}/quantity`, { quantity: newQty });
    setShowQtyModal(null);
    fetchItems();
  };

  const filtered = items.filter(i => i.product_name.toLowerCase().includes(search.toLowerCase()) || (i.category || '').toLowerCase().includes(search.toLowerCase()));
  const lowCount = items.filter(i => i.quantity <= i.minimum_stock_level).length;

  const fmtMoney = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Inventory</h2>
          <p>{items.length} items · {lowCount > 0 ? <span style={{ color: '#dc2626', fontWeight: 600 }}>{lowCount} low stock!</span> : 'All stock levels OK'}</p>
        </div>
        <button id="add-inventory-btn" className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Item</button>
      </div>

      {lowCount > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
          <AlertTriangle size={16} />
          <div>
            <strong>{lowCount} item{lowCount > 1 ? 's' : ''} running low on stock.</strong> Time to restock soon!
          </div>
        </div>
      )}

      <div className="search-bar">
        <div className="search-input-wrap" style={{ flex: 1 }}>
          <Search size={15} className="search-icon" />
          <input className="search-input" placeholder="Search products or categories..." value={search} onChange={e => setSearch(e.target.value)} id="inventory-search" />
        </div>
        <button className={`btn ${filterLowStock ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setFilterLowStock(!filterLowStock)}>
          <AlertTriangle size={14} /> {filterLowStock ? 'Show All' : 'Low Stock Only'}
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon"><Package size={28} /></div><h3>No inventory items</h3><p>Add products to track your stock levels</p></div>
          ) : (
            <table>
              <thead>
                <tr><th>Product</th><th>Category</th><th>Stock</th><th>Min Level</th><th>Unit Price</th><th>Supplier</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const isLow = item.quantity <= item.minimum_stock_level;
                  const isOut = item.quantity === 0;
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{item.product_name}</div>
                        {item.notes && <div style={{ fontSize: '11.5px', color: 'var(--gray-400)' }}>{item.notes}</div>}
                      </td>
                      <td><span className="badge badge-pink">{item.category || '—'}</span></td>
                      <td>
                        <button onClick={() => handleQtyUpdate(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} title="Click to update quantity">
                          <span style={{ fontSize: '15px', fontWeight: 700, color: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a' }}>{item.quantity}</span>
                          <span style={{ fontSize: '11px', color: 'var(--gray-400)' }}>units</span>
                        </button>
                      </td>
                      <td style={{ color: 'var(--gray-400)', fontSize: '13px' }}>{item.minimum_stock_level}</td>
                      <td style={{ fontSize: '13px' }}>{item.purchase_price > 0 ? fmtMoney(item.purchase_price) : '—'}</td>
                      <td style={{ fontSize: '12.5px', color: 'var(--gray-500)' }}>{item.supplier || '—'}</td>
                      <td>
                        {isOut ? <span className="badge badge-danger">⚠️ Out of Stock</span>
                          : isLow ? <span className="badge badge-warning">⚠️ Low Stock</span>
                          : <span className="badge badge-success">✓ OK</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(item)} title="Edit"><Edit size={13} /></button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(item.id)} title="Delete"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              <h3>{editItem ? '✏️ Edit Item' : '📦 Add Inventory Item'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error"><X size={14} />{error}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input className="form-control" value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} placeholder="e.g. Nail Polish - Red" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input type="number" className="form-control" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Min Stock Level</label>
                    <input type="number" className="form-control" value={form.minimum_stock_level} onChange={e => setForm({ ...form, minimum_stock_level: e.target.value })} placeholder="5" min="0" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Purchase Price (Rs.)</label>
                    <input type="number" className="form-control" value={form.purchase_price} onChange={e => setForm({ ...form, purchase_price: e.target.value })} placeholder="0.00" min="0" step="0.01" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Supplier</label>
                    <input className="form-control" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-control" rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." style={{ minHeight: '60px' }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <>{editItem ? 'Update Item' : 'Add Item'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Qty Update Modal */}
      {showQtyModal && (
        <div className="modal-overlay" onClick={() => setShowQtyModal(null)}>
          <div className="modal" style={{ maxWidth: '360px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Stock: {showQtyModal.product_name}</h3>
              <button className="modal-close" onClick={() => setShowQtyModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">New Quantity</label>
                <input type="number" className="form-control" value={newQty} onChange={e => setNewQty(e.target.value)} min="0" autoFocus style={{ fontSize: '20px', textAlign: 'center' }} />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Minimum level: {showQtyModal.minimum_stock_level} units</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowQtyModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveQty}>Update Stock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
