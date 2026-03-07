const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'nailsaloon.db');

function initializeDatabase() {
  const db = new Database(DB_PATH);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'owner',
      phone TEXT,
      salon_name TEXT DEFAULT 'Nail Saloon',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone_number TEXT,
      email TEXT,
      notes TEXT,
      preferred_services TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      duration_minutes INTEGER DEFAULT 60,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      service_id INTEGER,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      status TEXT DEFAULT 'booked',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id INTEGER,
      customer_id INTEGER,
      service_id INTEGER,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'cash',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      supplier TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      category TEXT,
      quantity INTEGER DEFAULT 0,
      minimum_stock_level INTEGER DEFAULT 5,
      purchase_price REAL DEFAULT 0,
      supplier TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread',
      related_item_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin user
  const userExists = db.prepare('SELECT id FROM users WHERE email = ?').get('owner@nailsaloon.com');
  if (!userExists) {
    const hash = bcrypt.hashSync('saloon123', 10);
    db.prepare(`INSERT INTO users (full_name, email, password_hash, role, salon_name) VALUES (?, ?, ?, ?, ?)`).run(
      'Salon Owner', 'owner@nailsaloon.com', hash, 'owner', 'Nail Saloon'
    );
  }

  // Seed sample services
  const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get();
  if (serviceCount.count === 0) {
    const insertService = db.prepare('INSERT INTO services (service_name, description, price, duration_minutes) VALUES (?, ?, ?, ?)');
    insertService.run('Classic Manicure', 'Basic nail shaping, cuticle care, and polish', 800, 45);
    insertService.run('Classic Pedicure', 'Foot soak, nail shaping, cuticle care, and polish', 1200, 60);
    insertService.run('Gel Polish', 'Long-lasting gel polish application', 1500, 60);
    insertService.run('Nail Art', 'Custom nail art designs', 500, 30);
    insertService.run('Bridal Package', 'Full bridal nail package with nail art', 5000, 180);
    insertService.run('Acrylic Extensions', 'Full set acrylic nail extensions', 3000, 120);
    insertService.run('Nail Removal', 'Safe removal of gel or acrylic nails', 600, 30);
  }

  // Seed sample inventory
  const inventoryCount = db.prepare('SELECT COUNT(*) as count FROM inventory').get();
  if (inventoryCount.count === 0) {
    const insertItem = db.prepare('INSERT INTO inventory (product_name, category, quantity, minimum_stock_level, purchase_price, supplier) VALUES (?, ?, ?, ?, ?, ?)');
    insertItem.run('Nail Polish - Red', 'Nail Polish', 15, 5, 250, 'Beauty Supplies Co.');
    insertItem.run('Nail Polish - Pink', 'Nail Polish', 3, 5, 250, 'Beauty Supplies Co.');
    insertItem.run('Gel Base Coat', 'Gel Products', 8, 3, 800, 'Pro Nail Store');
    insertItem.run('Gel Top Coat', 'Gel Products', 2, 3, 800, 'Pro Nail Store');
    insertItem.run('Acetone Remover', 'Removers', 20, 5, 350, 'Beauty Supplies Co.');
    insertItem.run('Disposable Gloves', 'Tools', 50, 20, 15, 'Medical Supplies');
    insertItem.run('Cotton Pads', 'Supplies', 4, 10, 120, 'Local Store');
    insertItem.run('Nail File - Grit 180', 'Tools', 30, 10, 50, 'Beauty Supplies Co.');
    insertItem.run('Cuticle Oil', 'Nail Polish', 6, 3, 400, 'Pro Nail Store');
    insertItem.run('Nail Decorations Kit', 'Decorations', 1, 2, 1500, 'Online Store');
  }

  // Seed sample customers
  const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get();
  if (customerCount.count === 0) {
    const insertCustomer = db.prepare('INSERT INTO customers (full_name, phone_number, notes, preferred_services) VALUES (?, ?, ?, ?)');
    insertCustomer.run('Sania Perera', '0771234567', 'Prefers light pink shades', 'Gel Polish, Manicure');
    insertCustomer.run('Nimasha Silva', '0782345678', 'Regular monthly customer', 'Classic Pedicure');
    insertCustomer.run('Kavindya Fernando', '0763456789', 'Interested in nail art', 'Nail Art, Gel Polish');
  }

  return db;
}

module.exports = { initializeDatabase, DB_PATH };
