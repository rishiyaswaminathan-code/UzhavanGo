const express = require('express');
const cors = require('cors');
require('dotenv').config();

const path = require('path');

const { initDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const offerRoutes = require('./routes/offerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static produce images
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'UzhavanGo API is running', timestamp: new Date().toISOString() });
});

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Compatibility alias routes
app.post('/api/admin/login', authRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>UzhavanGo API Server</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #f8faf8; color: #1f2937; padding: 2rem; }
          .card { background: white; max-width: 600px; margin: 2rem auto; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          h1 { color: #1e7e34; margin-top: 0; }
          .tag { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 0.25rem 0.75rem; border-radius: 20px; font-weight: bold; font-size: 0.85rem; }
          ul { line-height: 1.8; }
          a { color: #1e7e34; text-decoration: none; font-weight: 600; }
          a:hover { text-decoration: underline; }
          .btn { display: inline-block; background: #1e7e34; color: white; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🌾 UzhavanGo Backend REST API</h1>
          <span class="tag">● Server Status: Online</span>
          <p>The Node.js + Express.js REST API is running and serving requests.</p>
          <h3>Available Endpoints:</h3>
          <ul>
            <li><a href="/api/health">/api/health</a> &mdash; Server health status</li>
            <li><a href="/api/posts">/api/posts</a> &mdash; Produce listings</li>
            <li><a href="/api/orders">/api/orders</a> &mdash; Orders API</li>
          </ul>
          <p>To access the main web application UI:</p>
          <a class="btn" href="http://localhost:3000">Open React Web App (Port 3000) &rarr;</a>
        </div>
      </body>
    </html>
  `);
});

// 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await initDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 UzhavanGo Backend REST API running at http://localhost:${PORT}`);
    console.log(`🚀 Ready to handle React Frontend requests`);
  });
}

startServer();

module.exports = app;
