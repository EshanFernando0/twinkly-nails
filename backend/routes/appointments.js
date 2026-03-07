const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

module.exports = (db) => {
  // GET /api/appointments
  router.get('/', authenticateToken, (req, res) => {
    try {
      const { date, month, year, status } = req.query;
      let query = `
        SELECT a.*,
          c.full_name as customer_name, c.phone_number,
          s.service_name, s.price, s.duration_minutes
        FROM appointments a
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN services s ON a.service_id = s.id
        WHERE 1=1
      `;
      const params = [];

      if (date) { query += ' AND a.appointment_date = ?'; params.push(date); }
      if (month && year) {
        query += " AND strftime('%m', a.appointment_date) = ? AND strftime('%Y', a.appointment_date) = ?";
        params.push(String(month).padStart(2, '0'), String(year));
      }
      if (status) { query += ' AND a.status = ?'; params.push(status); }

      query += ' ORDER BY a.appointment_date ASC, a.appointment_time ASC';
      const appointments = db.prepare(query).all(...params);
      res.json(appointments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/appointments/:id
  router.get('/:id', authenticateToken, (req, res) => {
    try {
      const appointment = db.prepare(`
        SELECT a.*,
          c.full_name as customer_name, c.phone_number,
          s.service_name, s.price, s.duration_minutes
        FROM appointments a
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN services s ON a.service_id = s.id
        WHERE a.id = ?
      `).get(req.params.id);
      if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });
      res.json(appointment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/appointments
  router.post('/', authenticateToken, (req, res) => {
    try {
      const { customer_id, service_id, appointment_date, appointment_time, notes } = req.body;
      if (!appointment_date || !appointment_time) {
        return res.status(400).json({ error: 'Date and time are required.' });
      }

      const result = db.prepare(
        'INSERT INTO appointments (customer_id, service_id, appointment_date, appointment_time, status, notes) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(customer_id || null, service_id || null, appointment_date, appointment_time, 'booked', notes || null);

      const appointment = db.prepare(`
        SELECT a.*, c.full_name as customer_name, s.service_name, s.price, s.duration_minutes
        FROM appointments a
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN services s ON a.service_id = s.id
        WHERE a.id = ?
      `).get(result.lastInsertRowid);
      res.status(201).json(appointment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/appointments/:id
  router.put('/:id', authenticateToken, (req, res) => {
    try {
      const { customer_id, service_id, appointment_date, appointment_time, status, notes } = req.body;
      const existing = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Appointment not found.' });

      db.prepare(
        'UPDATE appointments SET customer_id = ?, service_id = ?, appointment_date = ?, appointment_time = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(customer_id || null, service_id || null, appointment_date, appointment_time, status, notes || null, req.params.id);

      // If just completed, create notification
      if (status === 'completed' && existing.status !== 'completed') {
        const service = service_id ? db.prepare('SELECT * FROM services WHERE id = ?').get(service_id) : null;
        db.prepare(
          'INSERT INTO notifications (type, title, message, related_item_id) VALUES (?, ?, ?, ?)'
        ).run(
          'appointment_completed',
          'Appointment Completed',
          `Appointment completed. Would you like to record income${service ? ' of Rs. ' + service.price : ''}?`,
          req.params.id
        );
      }

      const appointment = db.prepare(`
        SELECT a.*, c.full_name as customer_name, s.service_name, s.price, s.duration_minutes
        FROM appointments a
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN services s ON a.service_id = s.id
        WHERE a.id = ?
      `).get(req.params.id);
      res.json(appointment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/appointments/:id
  router.delete('/:id', authenticateToken, (req, res) => {
    try {
      const existing = db.prepare('SELECT id FROM appointments WHERE id = ?').get(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Appointment not found.' });
      db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
      res.json({ message: 'Appointment deleted.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/appointments/:id/complete — Mark complete and auto-create income
  router.post('/:id/complete', authenticateToken, (req, res) => {
    try {
      const { payment_method, notes: incomeNotes, amount } = req.body;
      const appointment = db.prepare(`
        SELECT a.*, s.price FROM appointments a
        LEFT JOIN services s ON a.service_id = s.id WHERE a.id = ?
      `).get(req.params.id);
      if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

      db.prepare('UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run('completed', req.params.id);

      const incomeAmount = parseFloat(amount) || appointment.price || 0;
      const incomeResult = db.prepare(
        'INSERT INTO income (appointment_id, customer_id, service_id, date, amount, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(
        appointment.id, appointment.customer_id, appointment.service_id,
        appointment.appointment_date, incomeAmount, payment_method || 'cash', incomeNotes || null
      );

      const income = db.prepare('SELECT * FROM income WHERE id = ?').get(incomeResult.lastInsertRowid);
      res.json({ message: 'Appointment completed and income recorded.', income });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
