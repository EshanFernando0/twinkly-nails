import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Package } from 'lucide-react';
import api from '../api/client';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#f43f7b','#e879a0','#b8779f','#9a5480','#fda4af','#fb7185','#fecdd3'];

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const { data: d } = await api.get('/reports', { params: { month, year } });
      setData(d);
    } catch {}
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const fmtMoney = (n) => `Rs. ${Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

  const incomeVsExpenseData = (() => {
    const incomeMap = {};
    data?.income_by_day?.forEach(d => { incomeMap[d.date] = d.total; });
    const expenseMap = {};
    data?.expenses_by_day?.forEach(d => { expenseMap[d.date] = d.total; });
    const dates = [...new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)])].sort();
    return dates.slice(-14).map(d => ({ date: d.slice(5), income: incomeMap[d] || 0, expense: expenseMap[d] || 0 }));
  })();

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      <span>Generating report...</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Monthly Reports</h2>
          <p>Business summary for {MONTHS[month-1]} {year}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select className="form-control" style={{ maxWidth: '110px' }} value={month} onChange={e => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select className="form-control" style={{ maxWidth: '90px' }} value={year} onChange={e => setYear(Number(e.target.value))}>
            {[2023,2024,2025,2026].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stat-cards-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card green">
          <div className="stat-icon green"><TrendingUp size={20} /></div>
          <div className="stat-label">Total Income</div>
          <div className="stat-value" style={{ fontSize: '18px' }}>{fmtMoney(data?.total_income)}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red"><TrendingDown size={20} /></div>
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value" style={{ fontSize: '18px' }}>{fmtMoney(data?.total_expenses)}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon purple"><DollarSign size={20} /></div>
          <div className="stat-label">Net Profit</div>
          <div className="stat-value" style={{ fontSize: '18px', color: data?.net_profit >= 0 ? '#16a34a' : '#dc2626' }}>
            {fmtMoney(data?.net_profit)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink"><BarChart3 size={20} /></div>
          <div className="stat-label">Profit Margin</div>
          <div className="stat-value" style={{ fontSize: '18px', color: 'var(--pink-600)' }}>
            {data?.total_income > 0 ? `${Math.round((data.net_profit / data.total_income) * 100)}%` : '—'}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Income vs Expense Line Chart */}
        <div className="card">
          <div className="card-header"><h3>📈 Income vs Expenses (Daily)</h3></div>
          <div className="card-body">
            {incomeVsExpenseData.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px' }}><p>No data for this period</p></div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={incomeVsExpenseData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5e6f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                  <Tooltip formatter={(v) => `Rs. ${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 10, border: '1px solid var(--pink-100)', fontSize: 12 }} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#f43f7b" strokeWidth={2.5} dot={{ r: 3, fill: '#f43f7b' }} name="Income" />
                  <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3, fill: '#f43f5e' }} name="Expenses" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Expenses by Category Pie */}
        <div className="card">
          <div className="card-header"><h3>🥧 Expenses by Category</h3></div>
          <div className="card-body">
            {!data?.expenses_by_category?.length ? (
              <div className="empty-state" style={{ padding: '40px' }}><p>No expenses this period</p></div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={data.expenses_by_category} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={70} label={({ category, percent }) => `${Math.round(percent * 100)}%`} labelLine={false}>
                      {data.expenses_by_category.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `Rs. ${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: 10, border: '1px solid var(--pink-100)', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                  {data.expenses_by_category.slice(0,5).map((cat, i) => (
                    <div key={cat.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                        <span style={{ color: 'var(--gray-600)' }}>{cat.category}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--gray-700)' }}>{fmtMoney(cat.total)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Top Services */}
        <div className="card">
          <div className="card-header"><h3>💅 Most Popular Services</h3></div>
          <div className="card-body" style={{ padding: '16px' }}>
            {!data?.top_services?.length ? (
              <div className="empty-state" style={{ padding: '32px' }}><p>No completed services this period</p></div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.top_services} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                  <YAxis type="category" dataKey="service_name" tick={{ fontSize: 11, fill: '#52525b' }} width={100} />
                  <Tooltip formatter={(v) => `${v} bookings`} contentStyle={{ borderRadius: 10, border: '1px solid var(--pink-100)', fontSize: 12 }} />
                  <Bar dataKey="booking_count" fill="url(#pinkGrad)" radius={[0, 6, 6, 0]} name="Bookings">
                    {data.top_services.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Appointment Stats */}
        <div className="card">
          <div className="card-header"><h3>📋 Appointment Summary</h3></div>
          <div className="card-body">
            {!data?.appointment_stats?.length ? (
              <div className="empty-state" style={{ padding: '32px' }}><p>No appointments this period</p></div>
            ) : (
              <>
                {data.appointment_stats.map(stat => {
                  const total = data.appointment_stats.reduce((s, x) => s + x.count, 0);
                  const pct = Math.round((stat.count / total) * 100);
                  const colors = { booked: '#f43f7b', completed: '#16a34a', cancelled: '#a1a1aa' };
                  return (
                    <div key={stat.status} style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)', textTransform: 'capitalize' }}>{stat.status}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>{stat.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--gray-100)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: colors[stat.status] || '#a1a1aa', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: '16px', padding: '12px', background: 'var(--pink-50)', borderRadius: '10px', fontSize: '13px', color: 'var(--pink-700)', fontWeight: 600 }}>
                  Total: {data.appointment_stats.reduce((s, x) => s + x.count, 0)} appointments
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Report */}
      {data?.low_stock_items?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3><Package size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: '#d97706' }} />Low Stock Report</h3>
            <span className="badge badge-warning">{data.low_stock_items.length} items</span>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Product</th><th>Category</th><th>Current Stock</th><th>Minimum Level</th><th>Supplier</th></tr></thead>
              <tbody>
                {data.low_stock_items.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                    <td><span className="badge badge-pink">{item.category || '—'}</span></td>
                    <td><span style={{ fontWeight: 700, color: item.quantity === 0 ? '#dc2626' : '#d97706' }}>{item.quantity} units</span></td>
                    <td style={{ color: 'var(--gray-400)' }}>{item.minimum_stock_level} units</td>
                    <td style={{ color: 'var(--gray-500)', fontSize: '12.5px' }}>{item.supplier || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {data?.payment_methods?.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header"><h3>💳 Payment Methods Breakdown</h3></div>
          <div className="card-body" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {data.payment_methods.map(pm => (
              <div key={pm.payment_method} style={{ flex: '1', minWidth: '140px', background: 'var(--nude-50)', borderRadius: '12px', padding: '16px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--pink-600)' }}>
                  {pm.count}
                </div>
                <div style={{ fontSize: '12px', textTransform: 'capitalize', color: 'var(--gray-500)', marginBottom: '4px' }}>{pm.payment_method} payments</div>
                <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#16a34a' }}>Rs. {Number(pm.total).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
