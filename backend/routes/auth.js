const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');

module.exports = (db) => {
  // POST /api/auth/login
  router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        salon_name: user.salon_name
      }
    });
  });

  // GET /api/auth/me
  router.get('/me', authenticateToken, (req, res) => {
    const user = db.prepare('SELECT id, full_name, email, role, phone, salon_name, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  });

  // PUT /api/auth/profile
  router.put('/profile', authenticateToken, (req, res) => {
    const { full_name, phone, salon_name } = req.body;
    db.prepare('UPDATE users SET full_name = ?, phone = ?, salon_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(full_name, phone, salon_name, req.user.id);
    const user = db.prepare('SELECT id, full_name, email, role, phone, salon_name FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  });

  // PUT /api/auth/change-password
  router.put('/change-password', authenticateToken, (req, res) => {
    const { current_password, new_password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const valid = bcrypt.compareSync(current_password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }
    const hash = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hash, req.user.id);
    res.json({ message: 'Password changed successfully.' });
  });

  return router;
};
