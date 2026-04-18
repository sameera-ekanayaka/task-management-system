const express = require('express');
const router = express.Router();
const { login, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', login);

// Protected routes (must be logged in)
router.post('/reset-password', protect, resetPassword);

module.exports = router;