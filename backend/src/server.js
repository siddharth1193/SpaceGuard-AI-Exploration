'use strict';

// Load .env if it exists, otherwise fall back to .env.example (dev convenience)
const fs = require('fs');
const path = require('path');
const envFile = fs.existsSync(path.join(__dirname, '../../.env'))
  ? path.join(__dirname, '../../.env')
  : path.join(__dirname, '../../.env.example');
require('dotenv').config({ path: envFile });

const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server: SocketIOServer } = require('socket.io');
const rateLimit = require('express-rate-limit');

// Routes
const satelliteRoutes = require('./routes/satellites');
const healthRoutes = require('./routes/health');
const anomalyRoutes = require('./routes/anomalies');
const alertRoutes = require('./routes/alerts');
const spaceWeatherRoutes = require('./routes/spaceWeather');
const aiAnalysisRoutes = require('./routes/aiAnalysis');

// Services for real-time push
const { getAllSatellites } = require('./services/satelliteService');
const { getSpaceWeather } = require('./services/spaceWeatherService');
const { detectAllAnomalies } = require('./services/anomalyService');

// ── App setup ────────────────────────────────────────────────────────────────

const app = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST'],
  },
});

// ── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,            // requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests — please slow down.' },
});
app.use('/api', limiter);

// ── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/satellites', satelliteRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/space-weather', spaceWeatherRoutes);
app.use('/api/ai', aiAnalysisRoutes);

// API directory index
app.get('/api', (req, res) => {
  res.json({
    service: 'SpaceGuard AI API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      healthCheck: '/api/health-check',
      satellites: '/api/satellites',
      health: '/api/health',
      anomalies: '/api/anomalies',
      alerts: '/api/alerts',
      spaceWeather: '/api/space-weather',
      aiAnalyze: 'POST /api/ai/analyze',
      aiChat: 'POST /api/ai/chat',
    },
    timestamp: new Date().toISOString(),
  });
});

// Server health check (distinct from satellite health endpoint)
app.get('/api/health-check', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Root health check
app.get('/', (req, res) => {
  res.json({
    service: 'SpaceGuard AI Backend',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
  });
});

// ── Global error handler ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[server] Unhandled error:', err.message);
  res.status(err.status ?? 500).json({
    success: false,
    error: err.message ?? 'Internal server error',
    meta: { timestamp: new Date().toISOString() },
  });
});

// ── Socket.IO ────────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[socket.io] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[socket.io] Client disconnected: ${socket.id}`);
  });
});

/**
 * Broadcast a satellite update snapshot to all connected clients.
 */
async function broadcastSatelliteUpdate() {
  try {
    const weather = await getSpaceWeather();
    const satellites = await getAllSatellites(weather.kpIndex);
    const anomalies = detectAllAnomalies(satellites, weather.kpIndex);

    io.emit('satellite:update', {
      satellites,
      weather,
      anomalyCount: anomalies.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[socket.io] Broadcast failed:', err.message);
  }
}

// Emit updates every 30 seconds
const UPDATE_INTERVAL_MS = 30 * 1000;
const broadcastInterval = setInterval(broadcastSatelliteUpdate, UPDATE_INTERVAL_MS);

// ── Start server ─────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '3001', 10);

httpServer.listen(PORT, () => {
  console.log(`\n🛰  SpaceGuard AI backend running on port ${PORT}`);
  console.log(`   REST API:  http://localhost:${PORT}/api`);
  console.log(`   Socket.IO: ws://localhost:${PORT}`);
  console.log(
    `   Gemini:    ${process.env.GEMINI_API_KEY ? 'configured (' + (process.env.GEMINI_MODEL || 'gemini-2.5-flash') + ')' : 'not configured (demo fallback active)'}`
  );
  console.log(`   Real-time updates every ${UPDATE_INTERVAL_MS / 1000}s\n`);
});

// ── Graceful shutdown ────────────────────────────────────────────────────────

function shutdown(signal) {
  console.log(`\n[server] ${signal} received — shutting down gracefully…`);
  clearInterval(broadcastInterval);
  io.close(() => {
    httpServer.close(() => {
      console.log('[server] Server closed.');
      process.exit(0);
    });
  });
  // Force exit after 10 seconds if graceful shutdown stalls
  setTimeout(() => {
    console.error('[server] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = { app, io };

