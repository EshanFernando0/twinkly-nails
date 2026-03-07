const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

module.exports = (db) => {
  // GET /api/expenses
  router.get('/', authenticateToken, (req, res) => {
    try {
      const { month, year, date, category } = req.query;
      let query = 'SELECT * FROM expenses WHERE 1=1';
      const params = [];

      if (date) { query += ' AND date = ?'; params.push(date); }
      if (month && year) {
        query += " AND strftime('%m', date) = ? AND strftime('%Y', date) = ?";
        params.push(String(month).padStart(2, '0'), String(year));
      }
      if (category) { query += ' AND category = ?'; params.push(category); }

      query += ' ORDER BY date DESC, created_at DESC';
      const records = db.prepare(query).all(...params);
      res.json(records);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/expenses/summary
  router.get('/summary', authenticateToken, (req, res) => {
    try {
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const year = String(new Date().getFullYear());

      const monthly = db.prepare(
        "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?"
      ).get(month, year);

      const byCategory = db.prepare(
        "SELECT category, COALESCE(SUM(amount), 0) as total FROM expenses WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ? GROUP BY category ORDER BY total DESC"
      ).all(month, year);

      res.json({ monthly: monthly.total, byCategory });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/expenses
  router.post('/', authenticateToken, (req, res) => {
    try {
      const { date, category, amount, supplier, notes } = req.body;
      if (!date || !category || !amount) return res.status(400).json({ error: 'Date, category, and amount are required.' });

      const result = db.prepare(
        'INSERT INTO expenses (date, category, amount, supplier, notes) VALUES (?, ?, ?, ?, ?)'
      ).run(date, category, parseFloat(amount), supplier || null, notes || null);

      const record = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json(record);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/expenses/:id
  router.put('/:id', authenticateToken, (req, res) => {
    try {
      const { date, category, amount, supplier, notes } = req.body;
      const existing = db.prepare('SELECT id FROM expenses WHERE id = ?').get(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Expense not found.' });

      db.prepare(
        'UPDATE expenses SET date = ?, category = ?, amount = ?, supplier = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(date, category, parseFloat(amount), supplier || null, notes || null, req.params.id);

      const record = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
      res.json(record);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/expenses/:id
  router.delete('/:id', authenticateToken, (req, res) => {
    try {
      const existing = db.prepare('SELECT id FROM expenses WHERE id = ?').get(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Expense not found.' });
      db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
      res.json({ message: 'Expense deleted.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
