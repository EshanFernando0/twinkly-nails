const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

module.exports = (db) => {
  // GET /api/income
  router.get('/', authenticateToken, (req, res) => {
    try {
      const { month, year, date, payment_method } = req.query;
      let query = `
        SELECT i.*,
          c.full_name as customer_name,
          s.service_name,
          a.appointment_time
        FROM income i
        LEFT JOIN customers c ON i.customer_id = c.id
        LEFT JOIN services s ON i.service_id = s.id
        LEFT JOIN appointments a ON i.appointment_id = a.id
        WHERE 1=1
      `;
      const params = [];

      if (date) { query += ' AND i.date = ?'; params.push(date); }
      if (month && year) {
        query += " AND strftime('%m', i.date) = ? AND strftime('%Y', i.date) = ?";
        params.push(String(month).padStart(2, '0'), String(year));
      }
      if (payment_method) { query += ' AND i.payment_method = ?'; params.push(payment_method); }

      query += ' ORDER BY i.date DESC, i.created_at DESC';
      const records = db.prepare(query).all(...params);
      res.json(records);
    } catch (err) {
      console.error('Income GET error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/income/summary
  router.get('/summary', authenticateToken, (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const year = String(new Date().getFullYear());
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const daily = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE date = ?').get(today);
      const weekly = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE date >= ?').get(weekStartStr);
      const monthly = db.prepare(
        "SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?"
      ).get(month, year);

      res.json({ daily: daily.total, weekly: weekly.total, monthly: monthly.total });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/income
  router.post('/', authenticateToken, (req, res) => {
    try {
      const { appointment_id, customer_id, service_id, date, amount, payment_method, notes } = req.body;
      if (!date || !amount) return res.status(400).json({ error: 'Date and amount are required.' });

      const result = db.prepare(
        'INSERT INTO income (appointment_id, customer_id, service_id, date, amount, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(appointment_id || null, customer_id || null, service_id || null, date, parseFloat(amount), payment_method || 'cash', notes || null);

      const record = db.prepare(`
        SELECT i.*, c.full_name as customer_name, s.service_name
        FROM income i
        LEFT JOIN customers c ON i.customer_id = c.id
        LEFT JOIN services s ON i.service_id = s.id
        WHERE i.id = ?
      `).get(result.lastInsertRowid);
      res.status(201).json(record);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/income/:id
  router.put('/:id', authenticateToken, (req, res) => {
    try {
      const { appointment_id, customer_id, service_id, date, amount, payment_method, notes } = req.body;
      const existing = db.prepare('SELECT id FROM income WHERE id = ?').get(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Income record not found.' });

      db.prepare(
        'UPDATE income SET appointment_id = ?, customer_id = ?, service_id = ?, date = ?, amount = ?, payment_method = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(appointment_id || null, customer_id || null, service_id || null, date, parseFloat(amount), payment_method, notes || null, req.params.id);

      const record = db.prepare(`
        SELECT i.*, c.full_name as customer_name, s.service_name
        FROM income i LEFT JOIN customers c ON i.customer_id = c.id
        LEFT JOIN services s ON i.service_id = s.id WHERE i.id = ?
      `).get(req.params.id);
      res.json(record);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/income/:id
  router.delete('/:id', authenticateToken, (req, res) => {
    try {
      const existing = db.prepare('SELECT id FROM income WHERE id = ?').get(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Income record not found.' });
      db.prepare('DELETE FROM income WHERE id = ?').run(req.params.id);
      res.json({ message: 'Income record deleted.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
