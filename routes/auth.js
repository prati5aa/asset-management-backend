const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  registerUser, loginUser, getMe, updateMe,
} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login',    loginUser);
router.get('/me',        protect, getMe);
router.put('/me',        protect, updateMe);

module.exports = router;