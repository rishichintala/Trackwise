const express = require('express');
const authController = require('../controllers/authController.cjs');
const authMiddleware = require('../middleware/authMiddleware.cjs');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.patch('/me/currency', authMiddleware, authController.updateCurrency);

module.exports = router;
