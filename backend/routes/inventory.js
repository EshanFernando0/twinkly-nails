const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

module.exports = (db) => {
  // GET /api/inventory
  router.get('/', authenticateToken, (req, res) => {
    const { low_stock, category } = req.query;
    let query = 'SELECT * FROM inventory WHERE 1=1';
    const params = [];

    if (low_stock === 'true') { query += ' AND quantity <= minimum_stock_level'; }
    if (category) { query += ' AND category = ?'; params.push(category); }

    query += ' ORDER BY product_name ASC';
    const items = db.prepare(query).all(...params);
    res.json(items);
  });

  // GET /api/inventory/low-stock
  router.get('/low-stock', authenticateToken, (req, res) => {
    const items = db.prepare('SELECT * FROM inventory WHERE quantity <= minimum_stock_level ORDER BY quantity ASC').all();
    res.json(items);
  });

  // POST /api/inventory
  router.post('/', authenticateToken, (req, res) => {
    const { product_name, category, quantity, minimum_stock_level, purchase_price, supplier, notes } = req.body;
    if (!product_name) return res.status(400).json({ error: 'Product name is required.' });

    const result = db.prepare(
      'INSERT INTO inventory (product_name, category, quantity, minimum_stock_level, purchase_price, supplier, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(product_name, category || null, parseInt(quantity) || 0, parseInt(minimum_stock_level) || 5, parseFloat(purchase_price) || 0, supplier || null, notes || null);

    // Check if low stock and create notification
    const item = db.prepare('SELECT * FROM inventory WHERE id = ?').get(result.lastInsertRowid);
    if (item.quantity <= item.minimum_stock_level) {
      db.prepare('INSERT INTO notifications (type, title, message, related_item_id) VALUES (?, ?, ?, ?)')
        .run('low_stock', 'Low Stock Alert', `${item.product_name} is running low (${item.quantity} remaining).`, item.id);
    }

    res.status(201).json(item);
  });

  // PUT /api/inventory/:id
  router.put('/:id', authenticateToken, (req, res) => {
    const { product_name, category, quantity, minimum_stock_level, purchase_price, supplier, notes } = req.body;
    const existing = db.prepare('SELECT id FROM inventory WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Inventory item not found.' });

    db.prepare(
      'UPDATE inventory SET product_name = ?, category = ?, quantity = ?, minimum_stock_level = ?, purchase_price = ?, supplier = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(product_name, category, parseInt(quantity), parseInt(minimum_stock_level), parseFloat(purchase_price), supplier, notes, req.params.id);

    const item = db.prepare('SELECT * FROM inventory WHERE id = ?').get(req.params.id);

    // Check low stock
    if (item.quantity <= item.minimum_stock_level) {
      const existingAlert = db.prepare('SELECT id FROM notifications WHERE type = ? AND related_item_id = ? AND status = ?').get('low_stock', item.id, 'unread');
      if (!existingAlert) {
        db.prepare('INSERT INTO notifications (type, title, message, related_item_id) VALUES (?, ?, ?, ?)')
          .run('low_stock', 'Low Stock Alert', `${item.product_name} is running low (${item.quantity} remaining).`, item.id);
      }
    }

    res.json(item);
  });

  // PATCH /api/inventory/:id/quantity - Quick stock update
  router.patch('/:id/quantity', authenticateToken, (req, res) => {
    const { quantity } = req.body;
    const existing = db.prepare('SELECT * FROM inventory WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Inventory item not found.' });

    db.prepare('UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(parseInt(quantity), req.params.id);
    const item = db.prepare('SELECT * FROM inventory WHERE id = ?').get(req.params.id);

    if (item.quantity <= item.minimum_stock_level) {
      const existingAlert = db.prepare('SELECT id FROM notifications WHERE type = ? AND related_item_id = ? AND status = ?').get('low_stock', item.id, 'unread');
      if (!existingAlert) {
        db.prepare('INSERT INTO notifications (type, title, message, related_item_id) VALUES (?, ?, ?, ?)')
          .run('low_stock', 'Low Stock Alert', `${item.product_name} is running low (${item.quantity} remaining).`, item.id);
      }
    }

    res.json(item);
  });

  // DELETE /api/inventory/:id
  router.delete('/:id', authenticateToken, (req, res) => {
    const existing = db.prepare('SELECT id FROM inventory WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Inventory item not found.' });
    db.prepare('DELETE FROM inventory WHERE id = ?').run(req.params.id);
    res.json({ message: 'Inventory item deleted.' });
  });

  return router;
};
