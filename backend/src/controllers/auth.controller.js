'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

exports.signup = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body || {};

    const errors = {};
    if (!name || name.length < 3 || name.length > 100) errors.name = 'Name must be 3-100 characters';
    if (!isValidEmail(email)) errors.email = 'Invalid email';
    if (!address || address.length > 400) errors.address = 'Address is required and must be <= 400 chars';
    if (!password || password.length < 8) errors.password = 'Password must be at least 8 characters';
    const allowedRoles = ['user', 'admin', 'store_owner'];
    const nextRole = (role || 'user');
    if (!allowedRoles.includes(nextRole)) errors.role = 'Invalid role';
    if (nextRole === 'admin') return res.status(403).json({ message: 'Admin signup is disabled' });
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const pool = getPool();
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (rows.length) return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
const [result] = await pool.query(
  'INSERT INTO users (name, email, address, password_hash, role) VALUES (?, ?, ?, ?, ?)',
  [name, email.toLowerCase(), address, hash, nextRole]
);

if (nextRole === 'store_owner') {
  try {
    await pool.query(
      'INSERT INTO stores (name, email, address, owner_user_id) VALUES (?, ?, ?, ?)',
      ['Store of ' + name, email.toLowerCase(), address, result.insertId]
    );
  } catch (e) {
    console.error('Failed to create default store for owner:', e);
  }
}

return res.status(201).json({ message: 'Account created', userId: result.insertId });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    if (!isValidEmail(email) || !password) return res.status(400).json({ message: 'Invalid credentials' });

    const pool = getPool();

    // Admin-only login with configured credentials
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin123@gmail.com').toLowerCase();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@StoreRatings';
    const ADMIN_NAME = process.env.ADMIN_NAME || 'System Administrator';
    const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS || 'Admin HQ';
    if ((role || '').toLowerCase() === 'admin') {
      if (email.toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const [found] = await pool.query('SELECT id, name, email, address, role, password_hash FROM users WHERE email = ?', [ADMIN_EMAIL]);
      let adminUser;
      if (!found.length) {
        const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
        const [ins] = await pool.query('INSERT INTO users (name, email, address, password_hash, role) VALUES (?, ?, ?, ?, ?)', [ADMIN_NAME, ADMIN_EMAIL, ADMIN_ADDRESS, hash, 'admin']);
        adminUser = { id: ins.insertId, name: ADMIN_NAME, email: ADMIN_EMAIL, address: ADMIN_ADDRESS, role: 'admin' };
      } else {
        adminUser = found[0];
        if (adminUser.role !== 'admin') {
          await pool.query('UPDATE users SET role = ? WHERE id = ?', ['admin', adminUser.id]);
          adminUser.role = 'admin';
        }
      }
      const token = jwt.sign({ sub: adminUser.id }, JWT_SECRET, { expiresIn: '7d' });
      const cookieOpts = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 };
      res.cookie('token', token, cookieOpts);
      const { password_hash, ...safeAdmin } = adminUser;
      return res.status(200).json({ user: safeAdmin });
    }

    const [rows] = await pool.query('SELECT id, name, email, address, role, password_hash FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid email or password' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    if (role && user.role !== role) {
      return res.status(403).json({ message: 'Role mismatch for this account' });
    }

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const cookieOpts = {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie('token', token, cookieOpts);

    const { password_hash, ...safeUser } = user;
    return res.status(200).json({ user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT id, name, email, address, role, created_at FROM users WHERE id = ?', [req.userId]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    return res.status(200).json({ user: rows[0] });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie('token', { sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(200).json({ ok: true });
  }
};




