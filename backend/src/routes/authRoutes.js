const express = require('express');
const {
  register,
  login,
  getMe,
  refreshToken,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Routes protégées
router.get('/me', protect, getMe);

module.exports = router;