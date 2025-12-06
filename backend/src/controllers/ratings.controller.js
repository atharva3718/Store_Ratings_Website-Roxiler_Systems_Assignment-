'use strict';

const { getPool } = require('../config/db');

exports.rate = async (req, res) => {
  try {
    const userId = req.userId;
    const { storeId, rating } = req.body || {};
    const r = Number(rating);
    const s = Number(storeId);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!s || r < 1 || r > 5) return res.status(400).json({ message: 'Invalid input' });

    const pool = getPool();
    const [exists] = await pool.query('SELECT id FROM stores WHERE id = ?', [s]);
    if (!exists.length) return res.status(404).json({ message: 'Store not found' });

    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), created_at = NOW()`,
      [userId, s, r]
    );

    const [aggRows] = await pool.query(
      `SELECT COALESCE(AVG(rating),0) AS avgRating, COUNT(*) AS totalRatings FROM ratings WHERE store_id = ?`,
      [s]
    );
    const agg = aggRows[0] || { avgRating: 0, totalRatings: 0 };

    const [coreRows] = await pool.query('SELECT id, name, email, address, created_at FROM stores WHERE id = ?', [s]);
    const core = coreRows[0];

    const store = {
      id: core.id,
      name: core.name,
      email: core.email,
      address: core.address,
      avgRating: Number(agg.avgRating) || 0,
      totalRatings: Number(agg.totalRatings) || 0,
      myRating: r,
      created_at: core.created_at,
    };

    return res.status(200).json({ ok: true, store });
  } catch (err) {
    console.error('Rate store error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
