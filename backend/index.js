require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./db/schema');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
const db = initializeDatabase();
console.log('✅ Database initialized');

// ── CORS — allow localhost dev + any Vercel/Railway URL ──
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
];

// Accept any URL from env (set FRONTEND_URL on Railway)
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    // Allow any vercel.app or railway.app subdomain automatically
    if (
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin) ||
      /\.railway\.app$/.test(origin) ||
      /\.up\.railway\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',          require('./routes/auth')(db));
app.use('/api/dashboard',     require('./routes/dashboard')(db));
app.use('/api/customers',     require('./routes/customers')(db));
app.use('/api/services',      require('./routes/services')(db));
app.use('/api/appointments',  require('./routes/appointments')(db));
app.use('/api/income',        require('./routes/income')(db));
app.use('/api/expenses',      require('./routes/expenses')(db));
app.use('/api/inventory',     require('./routes/inventory')(db));
app.use('/api/reports',       require('./routes/reports')(db));
app.use('/api/notifications', require('./routes/notifications')(db));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '🌸 Twinkly Nails API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root
app.get('/', (req, res) => {
  res.json({ message: '✨ Twinkly Nails by Roshi — API Server' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌸 Twinkly Nails Server running on port ${PORT}`);
  console.log(`📋 API available at http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
