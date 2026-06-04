const express = require('express');
const router = express.Router();
const { protect }   = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/admin');
const {
  checkoutAsset, returnAsset,
  getMyActiveTransactions, getMyHistory,
  getAllTransactions,
} = require('../controllers/transactionController');

router.use(protect);

router.post('/checkout',     checkoutAsset);
router.put('/return/:id',    returnAsset);
router.get('/active',     getMyActiveTransactions);
router.get('/history',       getMyHistory);
router.get('/admin/all',     adminOnly, getAllTransactions);

module.exports = router;