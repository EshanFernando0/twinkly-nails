const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

module.exports = (db) => {
  // GET /api/notifications
  router.get('/', authenticateToken, (req, res) => {
    const notifications = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20').all();
    res.json(notifications);
  });

  // PUT /api/notifications/:id/read
  router.put('/:id/read', authenticateToken, (req, res) => {
    db.prepare('UPDATE notifications SET status = ? WHERE id = ?').run('read', req.params.id);
    res.json({ message: 'Notification marked as read.' });
  });

  // PUT /api/notifications/read-all
  router.put('/read-all', authenticateToken, (req, res) => {
    db.prepare('UPDATE notifications SET status = ? WHERE status = ?').run('read', 'unread');
    res.json({ message: 'All notifications marked as read.' });
  });

  return router;
};
