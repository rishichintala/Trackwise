const crypto = require('crypto');
const prisma = require('../prisma/client.cjs');

const MAX_KEYS_PER_USER = 5;

// POST /integrations/api-keys
// Generates a new API key for the authenticated user.
// Returns the raw key ONCE — it is never stored and cannot be retrieved again.
const generateApiKey = async (req, res) => {
    try {
        const count = await prisma.apiKey.count({ where: { userId: req.userId } });
        if (count >= MAX_KEYS_PER_USER) {
            return res.status(400).json({
                message: `Maximum of ${MAX_KEYS_PER_USER} API keys allowed. Revoke one first.`,
            });
        }

        const rawKey = `tw_live_${crypto.randomBytes(24).toString('base64url')}`;
        const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
        const label = (String(req.body?.label ?? '').trim() || 'Splito').slice(0, 50);

        await prisma.apiKey.create({
            data: { keyHash, label, userId: req.userId },
        });

        res.status(201).json({
            key: rawKey,
            label,
            message: 'Copy this key now. It will not be shown again.',
        });
    } catch (error) {
        console.error('Error generating API key:', error.message);
        res.status(500).json({ message: 'Failed to generate API key' });
    }
};

// GET /integrations/api-keys
// Lists all API keys for the authenticated user — id, label, lastUsedAt, createdAt only.
const listApiKeys = async (req, res) => {
    try {
        const keys = await prisma.apiKey.findMany({
            where: { userId: req.userId },
            select: { id: true, label: true, lastUsedAt: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(keys);
    } catch (error) {
        console.error('Error listing API keys:', error.message);
        res.status(500).json({ message: 'Failed to list API keys' });
    }
};

// DELETE /integrations/api-keys/:id
// Revokes a specific API key. Atomic ownership check prevents deleting another user's key.
const revokeApiKey = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await prisma.apiKey.deleteMany({
            where: { id, userId: req.userId },
        });
        if (result.count === 0) {
            return res.status(404).json({ message: 'API key not found' });
        }
        res.json({ message: 'API key revoked' });
    } catch (error) {
        console.error('Error revoking API key:', error.message);
        res.status(500).json({ message: 'Failed to revoke API key' });
    }
};

// GET /integrations/validate
// Called by Splito to confirm a key is valid and retrieve the user's display name + currency.
// Works with both JWT (user testing from Trackwise UI) and ApiKey (Splito calling from backend).
const validateApiKey = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { name: true, currency: true },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ valid: true, userName: user.name, currency: user.currency });
    } catch (error) {
        console.error('Error validating API key:', error.message);
        res.status(500).json({ message: 'Validation failed' });
    }
};

module.exports = { generateApiKey, listApiKeys, revokeApiKey, validateApiKey };
