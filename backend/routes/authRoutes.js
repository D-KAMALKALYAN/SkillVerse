// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');


// Pre-flight OPTIONS handler for CORS
router.options('*', (req, res) => {
  // Handle OPTIONS requests explicitly to ensure CORS headers are set
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(204);
});

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Validate token
router.post('/validate-token', auth, authController.validateToken);

// Request password reset via email
router.post('/request-password-reset', authController.requestPasswordReset);

// Forgot password (security questions)
router.post('/forgot-password', authController.forgotPassword);

// Verify security questions
router.post('/verify-security-questions', authController.verifySecurityQuestions);

// Reset password
router.post('/reset-password', authController.resetPassword);

// Add debug route to test if router is reachable
router.get('/status', (req, res) => {
  res.json({ status: 'Auth router is working' });
});

module.exports = router;