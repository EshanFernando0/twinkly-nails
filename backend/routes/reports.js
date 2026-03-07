const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

module.exports = (db) => {
  // GET /api/reports?month=3&year=2026
  router.get('/', authenticateToken, (req, res) => {
    try {
      const month = String(req.query.month || new Date().getMonth() + 1).padStart(2, '0');
      const year = String(req.query.year || new Date().getFullYear());

      const totalIncome = db.prepare(
        "SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?"
      ).get(month, year);

      const totalExpenses = db.prepare(
        "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?"
      ).get(month, year);

      const incomeByDay = db.prepare(
        "SELECT date, COALESCE(SUM(amount), 0) as total FROM income WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ? GROUP BY date ORDER BY date ASC"
      ).all(month, year);

      const expensesByDay = db.prepare(
        "SELECT date, COALESCE(SUM(amount), 0) as total FROM expenses WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ? GROUP BY date ORDER BY date ASC"
      ).all(month, year);

      const topServices = db.prepare(`
        SELECT s.service_name, COUNT(a.id) as booking_count, COALESCE(SUM(i.amount), 0) as revenue
        FROM appointments a
        LEFT JOIN services s ON a.service_id = s.id
        LEFT JOIN income i ON i.appointment_id = a.id
        WHERE strftime('%m', a.appointment_date) = ? AND strftime('%Y', a.appointment_date) = ? AND a.status = 'completed'
        GROUP BY s.id ORDER BY booking_count DESC LIMIT 6
      `).all(month, year);

      const expensesByCategory = db.prepare(
        "SELECT category, COALESCE(SUM(amount), 0) as total FROM expenses WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ? GROUP BY category ORDER BY total DESC"
      ).all(month, year);

      const appointmentStats = db.prepare(
        "SELECT status, COUNT(*) as count FROM appointments WHERE strftime('%m', appointment_date) = ? AND strftime('%Y', appointment_date) = ? GROUP BY status"
      ).all(month, year);

      const lowStockItems = db.prepare(
        'SELECT * FROM inventory WHERE quantity <= minimum_stock_level ORDER BY quantity ASC'
      ).all();

      const paymentMethods = db.prepare(
        "SELECT payment_method, COUNT(*) as count, SUM(amount) as total FROM income WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ? GROUP BY payment_method"
      ).all(month, year);

      res.json({
        month: parseInt(month),
        year: parseInt(year),
        total_income: totalIncome.total,
        total_expenses: totalExpenses.total,
        net_profit: totalIncome.total - totalExpenses.total,
        income_by_day: incomeByDay,
        expenses_by_day: expensesByDay,
        top_services: topServices,
        expenses_by_category: expensesByCategory,
        appointment_stats: appointmentStats,
        low_stock_items: lowStockItems,
        payment_methods: paymentMethods
      });
    } catch (err) {
      console.error('Reports error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
