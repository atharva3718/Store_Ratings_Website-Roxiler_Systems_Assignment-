'use strict';

const express = require('express');
const { getDashboardStats, getRecentActivities, createUser, createStore } = require('../controllers/admin.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(requireAuth, requireAdmin);

// Dashboard stats and activities
router.get('/stats', getDashboardStats);
router.get('/activities', getRecentActivities);

// Create user and store
router.post('/users', createUser);
router.post('/stores', createStore);

module.exports = router;
