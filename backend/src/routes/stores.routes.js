'use strict';

const express = require('express');
const { listStores, getStoreById, getMyStore, updateMyStore } = require('../controllers/stores.controller');
const { requireAuth, requireAdmin, requireStoreOwner } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, listStores);
router.get('/mine', requireAuth, requireStoreOwner, getMyStore);
router.put('/mine', requireAuth, requireStoreOwner, updateMyStore);
router.get('/:id', requireAuth, requireAdmin, getStoreById);


module.exports = router;



