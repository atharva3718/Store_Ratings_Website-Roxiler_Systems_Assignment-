'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { initDb } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const ratingsRoutes = require('./routes/ratings.routes');
const storesRoutes = require('./routes/stores.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
app.set('trust proxy', 1);

const ORIGINS = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((s) => s.trim());

app.use(cors({ origin: ORIGINS, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`API server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

