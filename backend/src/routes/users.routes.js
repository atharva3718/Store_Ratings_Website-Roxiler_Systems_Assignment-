'use strict';

const express = require('express');
const { listUsers, getUserById } = require('../controllers/users.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, requireAdmin, listUsers);
router.get('/:id', requireAuth, requireAdmin, getUserById);

module.exports = router;
