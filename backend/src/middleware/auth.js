'use strict';

const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

async function requireAdmin(req, res, next) {
  try {
    if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
    const pool = getPool();
    const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [req.userId]);
    if (!rows.length) return res.status(401).json({ message: 'Unauthorized' });
    if (rows[0].role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

async function requireStoreOwner(req, res, next) {
  try {
    if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
    const pool = getPool();
    const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [req.userId]);
    if (!rows.length) return res.status(401).json({ message: 'Unauthorized' });
    if (rows[0].role !== 'store_owner') return res.status(403).json({ message: 'Forbidden' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = { requireAuth, requireAdmin, requireStoreOwner };
