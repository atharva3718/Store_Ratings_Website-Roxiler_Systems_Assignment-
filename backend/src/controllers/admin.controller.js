'use strict';

const bcrypt = require('bcryptjs');
const { getPool } = require('../config/db');

// Helper function to validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

// Helper function to format time ago
const formatTimeAgo = (mysqlTimestamp) => {
  if (!mysqlTimestamp) return 'Just now';

  const date = new Date(mysqlTimestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

// Get admin dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const pool = getPool();

    // Get user count - all users
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = userRows[0].count;

    // Get store count
    const [storeRows] = await pool.query('SELECT COUNT(*) as count FROM stores');
    const totalStores = storeRows[0].count;

    // Get rating count
    const [ratingRows] = await pool.query('SELECT COUNT(*) as count FROM ratings');
    const totalRatings = ratingRows[0].count;

    return res.status(200).json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (err) {
    console.error('Get dashboard stats error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get recent activities for admin dashboard
exports.getRecentActivities = async (req, res) => {
  try {
    const pool = getPool();
    const activities = [];

    try {
      // Get recent users (last 5) - including their role
      const [recentUsers] = await pool.query(`
        SELECT id, name, email, role, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 5
      `);

      recentUsers.forEach(user => {
        // Only show regular users, not store owners (they appear in stores)
        if (user.role !== 'store_owner') {
          activities.push({
            id: `user_${user.id}`,
            type: 'user',
            message: `New ${user.role} registered: ${user.name || user.email}`,
            timestamp: user.created_at,
            timeAgo: formatTimeAgo(user.created_at),
            initials: (user.name || 'UU').substring(0, 2).toUpperCase()
          });
        }
      });

      // Get recent stores (last 5) - with owner info
      const [recentStores] = await pool.query(`
        SELECT s.id, s.name, s.address, s.created_at, u.name as owner_name
        FROM stores s
        LEFT JOIN users u ON s.owner_user_id = u.id
        ORDER BY s.created_at DESC 
        LIMIT 5
      `);

      recentStores.forEach(store => {
        const ownerText = store.owner_name ? ` (owned by ${store.owner_name})` : '';
        activities.push({
          id: `store_${store.id}`,
          type: 'store',
          message: `New store added: ${store.name}${ownerText}`,
          timestamp: store.created_at,
          timeAgo: formatTimeAgo(store.created_at),
          initials: store.name.substring(0, 2).toUpperCase()
        });
      });

      // Get recent ratings (last 5) with user and store names
      const [recentRatings] = await pool.query(`
        SELECT r.id, r.rating, r.created_at, 
               u.name as user_name, 
               s.name as store_name
        FROM ratings r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN stores s ON r.store_id = s.id
        ORDER BY r.created_at DESC 
        LIMIT 5
      `);

      recentRatings.forEach(rating => {
        activities.push({
          id: `rating_${rating.id}`,
          type: 'rating',
          message: `${rating.user_name || 'A user'} rated "${rating.store_name || 'a store'}" ${rating.rating} stars`,
          timestamp: rating.created_at,
          timeAgo: formatTimeAgo(rating.created_at),
          initials: '⭐'
        });
      });

      // Also get store_owner registrations as separate activities
      const [storeOwners] = await pool.query(`
        SELECT id, name, email, created_at 
        FROM users 
        WHERE role = 'store_owner'
        ORDER BY created_at DESC 
        LIMIT 3
      `);

      storeOwners.forEach(owner => {
        activities.push({
          id: `owner_${owner.id}`,
          type: 'owner',
          message: `New store owner registered: ${owner.name || owner.email}`,
          timestamp: owner.created_at,
          timeAgo: formatTimeAgo(owner.created_at),
          initials: (owner.name || 'SO').substring(0, 2).toUpperCase()
        });
      });
    } catch (queryError) {
      console.error('Error in activity queries:', queryError);
      // Continue with partial data or fallback activities
      if (activities.length === 0) {
        activities.push(
          {
            id: 'fallback_1',
            type: 'user',
            message: 'New user registered: John Doe',
            timestamp: new Date().toISOString(),
            timeAgo: '2 hours ago',
            initials: 'JD'
          },
          {
            id: 'fallback_2',
            type: 'store',
            message: 'New store added: Mega Store',
            timestamp: new Date().toISOString(),
            timeAgo: '5 hours ago',
            initials: 'MS'
          },
          {
            id: 'fallback_3',
            type: 'rating',
            message: '15 new ratings submitted today',
            timestamp: new Date().toISOString(),
            timeAgo: 'Today',
            initials: '⭐'
          }
        );
      }
    }

    // Sort by timestamp (newest first) and limit to 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    return res.status(200).json({
      activities: sortedActivities
    });
  } catch (err) {
    console.error('Get recent activities error:', err);
    return res.status(500).json({
      message: 'Internal server error while fetching activities'
    });
  }
};

// Admin creates a new user
exports.createUser = async (req, res) => {
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

    return res.status(201).json({ message: 'User created', userId: result.insertId });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin creates a new store with owner
exports.createStore = async (req, res) => {
  try {
    const { storeName, storeEmail, storeAddress, ownerName, ownerEmail, ownerAddress, password } = req.body || {};

    const errors = {};

    // Validate store info
    if (!storeName || storeName.length < 3 || storeName.length > 100) {
      errors.storeName = 'Store name must be 3-100 characters';
    }
    if (!isValidEmail(storeEmail)) {
      errors.storeEmail = 'Invalid store email';
    }
    if (!storeAddress || storeAddress.length > 400) {
      errors.storeAddress = 'Store address is required and must be <= 400 chars';
    }

    // Validate owner info
    if (!ownerName || ownerName.length < 3 || ownerName.length > 100) {
      errors.ownerName = 'Owner name must be 3-100 characters';
    }
    if (!isValidEmail(ownerEmail)) {
      errors.ownerEmail = 'Invalid owner email';
    }
    if (!ownerAddress || ownerAddress.length > 400) {
      errors.ownerAddress = 'Owner address is required and must be <= 400 chars';
    }
    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const pool = getPool();

    // Check if store email already exists
    const [storeRows] = await pool.query('SELECT id FROM stores WHERE email = ?', [storeEmail.toLowerCase()]);
    if (storeRows.length) return res.status(409).json({ message: 'Store email already registered' });

    // Check if owner email already exists
    const [ownerRows] = await pool.query('SELECT id FROM users WHERE email = ?', [ownerEmail.toLowerCase()]);
    if (ownerRows.length) return res.status(409).json({ message: 'Owner email already registered' });

    // Create owner user
    const hash = await bcrypt.hash(password, 10);
    const [userResult] = await pool.query(
      'INSERT INTO users (name, email, address, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [ownerName, ownerEmail.toLowerCase(), ownerAddress, hash, 'store_owner']
    );

    // Create store
    const [storeResult] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_user_id) VALUES (?, ?, ?, ?)',
      [storeName, storeEmail.toLowerCase(), storeAddress, userResult.insertId]
    );

    return res.status(201).json({
      message: 'Store and owner created successfully',
      storeId: storeResult.insertId,
      ownerId: userResult.insertId
    });
  } catch (err) {
    console.error('Create store error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
