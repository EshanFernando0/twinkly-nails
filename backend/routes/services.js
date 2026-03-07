const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

module.exports = (db) => {
  // GET /api/services
  router.get('/', authenticateToken, (req, res) => {
    const services = db.prepare(`
      SELECT s.*, COUNT(a.id) as booking_count 
      FROM services s 
      LEFT JOIN appointments a ON a.service_id = s.id 
      GROUP BY s.id 
      ORDER BY s.service_name ASC
    `).all();
    res.json(services);
  });

  // GET /api/services/:id
  router.get('/:id', authenticateToken, (req, res) => {
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found.' });
    res.json(service);
  });

  // POST /api/services
  router.post('/', authenticateToken, (req, res) => {
    const { service_name, description, price, duration_minutes } = req.body;
    if (!service_name || !price) return res.status(400).json({ error: 'Service name and price are required.' });

    const result = db.prepare(
      'INSERT INTO services (service_name, description, price, duration_minutes) VALUES (?, ?, ?, ?)'
    ).run(service_name, description || null, parseFloat(price), parseInt(duration_minutes) || 60);

    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(service);
  });

  // PUT /api/services/:id
  router.put('/:id', authenticateToken, (req, res) => {
    const { service_name, description, price, duration_minutes } = req.body;
    const existing = db.prepare('SELECT id FROM services WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Service not found.' });

    db.prepare(
      'UPDATE services SET service_name = ?, description = ?, price = ?, duration_minutes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(service_name, description, parseFloat(price), parseInt(duration_minutes), req.params.id);

    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    res.json(service);
  });

  // DELETE /api/services/:id
  router.delete('/:id', authenticateToken, (req, res) => {
    const existing = db.prepare('SELECT id FROM services WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Service not found.' });
    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    res.json({ message: 'Service deleted.' });
  });

  return router;
};
