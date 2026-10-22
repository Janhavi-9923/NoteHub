require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Basic setup ---
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Basic rate limiting: stops one client from hammering the API too fast
// (protects against brute-force login attempts, spam uploads, etc.)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use('/api/', limiter);

// --- Health check route (useful for testing that the server is alive) ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NoteHub backend is running.' });
});

// --- Feature routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// --- 404 handler for unknown API routes ---
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found.' }));

// --- Central error handler (must be last) ---
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 NoteHub backend running at http://localhost:${PORT}`);
  });
});
