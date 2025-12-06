'use strict';

const express = require('express');
const { rate } = require('../controllers/ratings.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, rate);

module.exports = router;
