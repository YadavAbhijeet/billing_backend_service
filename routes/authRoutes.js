const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

console.log('✅ Auth routes loaded');

router.post('/login', authController.login);
router.post('/google', authController.googleLogin);

module.exports = router;
