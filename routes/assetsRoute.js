const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { getAssets } = require('../controllers/assetController');

router.get('/', protect, getAssets);

module.exports = router;