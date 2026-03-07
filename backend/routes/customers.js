const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

module.exports = (db) => {
  // GET /api/customers
  router.get('/', authenticateToken, (req, res) => {
    const { search } = req.query;
    let query = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM appointments a WHERE a.customer_id = c.id) as visit_count,
        (SELECT MAX(appointment_date) FROM appointments a WHERE a.customer_id = c.id AND a.status = 'completed') as last_visit
      FROM customers c
    `;
    let params = [];
    if (search) {
      query += ' WHERE c.full_name LIKE ? OR c.phone_number LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }
    query += ' ORDER BY c.full_name ASC';
    const customers = db.prepare(query).all(...params);
    res.json(customers);
  });

  // GET /api/customers/:id
  router.get('/:id', authenticateToken, (req, res) => {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found.' });

    const appointments = db.prepare(`
      SELECT a.*, s.service_name, s.price 
      FROM appointments a 
      LEFT JOIN services s ON a.service_id = s.id 
      WHERE a.customer_id = ? 
      ORDER BY a.appointment_date DESC
    `).all(req.params.id);

    res.json({ ...customer, appointments });
  });

  // POST /api/customers
  router.post('/', authenticateToken, (req, res) => {
    const { full_name, phone_number, email, notes, preferred_services } = req.body;
    if (!full_name) return res.status(400).json({ error: 'Full name is required.' });

    const result = db.prepare(
      'INSERT INTO customers (full_name, phone_number, email, notes, preferred_services) VALUES (?, ?, ?, ?, ?)'
    ).run(full_name, phone_number || null, email || null, notes || null, preferred_services || null);

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(customer);
  });

  // PUT /api/customers/:id
  router.put('/:id', authenticateToken, (req, res) => {
    const { full_name, phone_number, email, notes, preferred_services } = req.body;
    const existing = db.prepare('SELECT id FROM customers WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Customer not found.' });

    db.prepare(
      'UPDATE customers SET full_name = ?, phone_number = ?, email = ?, notes = ?, preferred_services = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(full_name, phone_number, email, notes, preferred_services, req.params.id);

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    res.json(customer);
  });

  // DELETE /api/customers/:id
  router.delete('/:id', authenticateToken, (req, res) => {
    const existing = db.prepare('SELECT id FROM customers WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Customer not found.' });
    db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
    res.json({ message: 'Customer deleted.' });
  });

  return router;
};
