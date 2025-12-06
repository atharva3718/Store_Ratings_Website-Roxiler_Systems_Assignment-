'use strict';

const { getPool } = require('../config/db');

exports.listUsers = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users ORDER BY created_at DESC'
    );
    return res.status(200).json({ users: rows });
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const id = Number(req.params.id) || 0;
    if (!id) return res.status(400).json({ message: 'Invalid user id' });
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at AS createdAt FROM users WHERE id = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ user: rows[0] });
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
