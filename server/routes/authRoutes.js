const express = require('express');
const { register, login, getMe, updateCurrency } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.patch('/me/currency', authMiddleware, updateCurrency);

module.exports = router;
