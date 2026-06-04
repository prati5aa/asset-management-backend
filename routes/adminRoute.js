const express = require('express');
const router = express.Router();
const { protect }   = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/admin');
const {
  getMetrics,
  createAsset,
  getAllAssets,
  updateAsset,
  deleteAsset,
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/metrics',       getMetrics);
router.post('/assets',       createAsset);
router.get('/assets',        getAllAssets);
router.put('/assets/:id',    updateAsset);
router.delete('/assets/:id', deleteAsset);

module.exports = router;