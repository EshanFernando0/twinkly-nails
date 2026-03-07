const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

module.exports = (db) => {
  router.get('/', authenticateToken, (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const year = String(new Date().getFullYear());

      const todayAppointments = db.prepare(`
        SELECT a.*, c.full_name as customer_name, s.service_name
        FROM appointments a
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN services s ON a.service_id = s.id
        WHERE a.appointment_date = ? AND a.status != 'cancelled'
        ORDER BY a.appointment_time ASC
      `).all(today);

      const upcomingAppointments = db.prepare(`
        SELECT a.*, c.full_name as customer_name, s.service_name
        FROM appointments a
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN services s ON a.service_id = s.id
        WHERE a.appointment_date > ? AND a.status = 'booked'
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
        LIMIT 5
      `).all(today);

      const monthIncome = db.prepare(
        "SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?"
      ).get(month, year);

      const monthExpenses = db.prepare(
        "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?"
      ).get(month, year);

      const lowStockItems = db.prepare(
        'SELECT * FROM inventory WHERE quantity <= minimum_stock_level ORDER BY quantity ASC'
      ).all();

      const recentIncome = db.prepare(`
        SELECT i.*, c.full_name as customer_name, s.service_name
        FROM income i
        LEFT JOIN customers c ON i.customer_id = c.id
        LEFT JOIN services s ON i.service_id = s.id
        ORDER BY i.created_at DESC LIMIT 5
      `).all();

      const notifications = db.prepare(
        "SELECT * FROM notifications WHERE status = ? ORDER BY created_at DESC LIMIT 10"
      ).all('unread');

      const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get();

      const monthAppointmentsCount = db.prepare(
        "SELECT COUNT(*) as count FROM appointments WHERE strftime('%m', appointment_date) = ? AND strftime('%Y', appointment_date) = ?"
      ).get(month, year);

      res.json({
        today_appointments: todayAppointments,
        upcoming_appointments: upcomingAppointments,
        monthly_income: monthIncome.total,
        monthly_expenses: monthExpenses.total,
        net_profit: monthIncome.total - monthExpenses.total,
        low_stock_items: lowStockItems,
        low_stock_count: lowStockItems.length,
        recent_income: recentIncome,
        notifications,
        total_customers: totalCustomers.count,
        month_appointments_count: monthAppointmentsCount.count
      });
    } catch (err) {
      console.error('Dashboard error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
