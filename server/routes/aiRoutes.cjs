const express = require('express');
const aiController = require('../controllers/aiController.cjs');
const authMiddleware = require('../middleware/authMiddleware.cjs');

const router = express.Router();

router.use((req, res, next) => authMiddleware(req, res, next).catch(next));

router.get('/insights', aiController.getInsights);
router.post('/chat', aiController.chat);

module.exports = router;
