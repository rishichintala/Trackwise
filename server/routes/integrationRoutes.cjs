const express = require('express');
const { generateApiKey, listApiKeys, revokeApiKey, validateApiKey } = require('../controllers/integrationController.cjs');
const authMiddleware = require('../middleware/authMiddleware.cjs');

const router = express.Router();

router.use((req, res, next) => authMiddleware(req, res, next).catch(next));

router.post('/api-keys', generateApiKey);
router.get('/api-keys', listApiKeys);
router.delete('/api-keys/:id', revokeApiKey);
router.get('/validate', validateApiKey);

module.exports = router;
