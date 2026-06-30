const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../prisma/client.cjs');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization') || '';

    // API key auth path — header: "ApiKey tw_live_..."
    if (authHeader.startsWith('ApiKey ')) {
        const rawKey = authHeader.slice('ApiKey '.length).trim();
        if (!rawKey) {
            return res.status(401).json({ message: 'No API key provided' });
        }
        try {
            const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
            const apiKey = await prisma.apiKey.findUnique({
                where: { keyHash },
                select: { id: true, userId: true },
            });
            if (!apiKey) {
                return res.status(401).json({ message: 'Invalid API key' });
            }
            // Fire-and-forget — don't block the request on this update
            prisma.apiKey.update({
                where: { id: apiKey.id },
                data: { lastUsedAt: new Date() },
            }).catch(() => {});

            req.userId = apiKey.userId;
            return next();
        } catch (error) {
            return res.status(401).json({ message: 'API key validation failed' });
        }
    }

    // JWT auth path — header: "Bearer <token>"
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
