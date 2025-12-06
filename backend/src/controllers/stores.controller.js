'use strict';

const { getPool } = require('../config/db');

exports.listStores = async (req, res) => {
  try {
    const pool = getPool();
    // Backfill: ensure every store_owner user has a store row
    await pool.query(`
      INSERT INTO stores (name, email, address, owner_user_id)
      SELECT CONCAT('Store of ', u.name), u.email, u.address, u.id
      FROM users u
      LEFT JOIN stores s ON s.owner_user_id = u.id
      WHERE u.role = 'store_owner' AND s.id IS NULL
    `);

    const [rows] = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        COALESCE(AVG(r.rating), 0) AS avgRating,
        COUNT(r.id) AS totalRatings,
        my.rating AS myRating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      LEFT JOIN ratings my ON my.store_id = s.id AND my.user_id = ?
      GROUP BY s.id
      ORDER BY s.created_at DESC
      `,
      [req.userId || 0]
    );
    const stores = rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      address: r.address,
      avgRating: Number(r.avgRating) || 0,
      totalRatings: Number(r.totalRatings) || 0,
      myRating: r.myRating || null,
      created_at: r.created_at,
    }));
    return res.status(200).json({ stores });
  } catch (err) {
    console.error('List stores error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getStoreById = async (req, res) => {
  try {
    const id = Number(req.params.id) || 0;
    if (!id) return res.status(400).json({ message: 'Invalid store id' });
    const pool = getPool();
    const [coreRows] = await pool.query(
      `
      SELECT
        s.id, s.name, s.email, s.address, s.created_at,
        COALESCE(AVG(r.rating), 0) AS avgRating,
        COUNT(r.id) AS totalRatings
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.id = ?
      `,
      [id]
    );
    if (!coreRows.length) return res.status(404).json({ message: 'Store not found' });
    const core = coreRows[0];
    const [raters] = await pool.query(
      `
      SELECT r.id, u.name, r.rating, r.created_at
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
      LIMIT 50
      `,
      [id]
    );
    const store = {
      id: core.id,
      name: core.name,
      email: core.email,
      address: core.address,
      avgRating: Number(core.avgRating) || 0,
      totalRatings: Number(core.totalRatings) || 0,
      created_at: core.created_at,
      raters,
    };
    return res.status(200).json({ store });
  } catch (err) {
    console.error('Get store error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMyStore = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT s.id FROM stores s WHERE s.owner_user_id = ? LIMIT 1`,
      [req.userId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Store not found' });
    req.params.id = rows[0].id;
    return exports.getStoreById(req, res);
  } catch (err) {
    console.error('Get my store error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateMyStore = async (req, res) => {
  try {
    const { name, email, address } = req.body || {};

    const errors = {};
    if (!name || name.length < 3 || name.length > 100) {
      errors.name = 'Store name must be 3-100 characters';
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email address';
    }
    if (!address || address.length > 400) {
      errors.address = 'Address is required and must be <= 400 characters';
    }

    if (Object.keys(errors).length) {
      return res.status(400).json({ errors });
    }

    const pool = getPool();

    // Get the store owned by this user
    const [storeRows] = await pool.query(
      `SELECT s.id FROM stores s WHERE s.owner_user_id = ? LIMIT 1`,
      [req.userId]
    );

    if (!storeRows.length) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const storeId = storeRows[0].id;

    // Update the store
    await pool.query(
      `UPDATE stores SET name = ?, email = ?, address = ? WHERE id = ?`,
      [name, email.toLowerCase(), address, storeId]
    );

    return res.status(200).json({ message: 'Store updated successfully' });
  } catch (err) {
    console.error('Update my store error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

