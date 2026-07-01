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
        let apiKey;
        try {
            const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
            apiKey = await prisma.apiKey.findUnique({
                where: { keyHash },
                select: { id: true, userId: true },
            });
        } catch (error) {
            return next(error);
        }

        if (!apiKey) {
            return res.status(401).json({ message: 'Invalid API key' });
        }

        // Awaited so the update completes before serverless context is frozen.
        // Failure is non-fatal — auth proceeds regardless.
        try {
            await prisma.apiKey.update({
                where: { id: apiKey.id },
                data: { lastUsedAt: new Date() },
            });
        } catch (err) {
            console.error('Failed to update lastUsedAt:', err.message);
        }

        req.userId = apiKey.userId;
        return next();
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
