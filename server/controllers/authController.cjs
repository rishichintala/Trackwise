const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client.cjs');
const { sendPasswordResetEmail } = require('../services/emailService.cjs');

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashResetToken(rawToken) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function getFrontendUrl() {
    if (process.env.FRONTEND_URL) {
        return process.env.FRONTEND_URL.replace(/\/+$/, '');
    }
    return 'http://localhost:5173';
}

const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, token });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

// Return the current user's profile (including currency preference)
const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, name: true, email: true, currency: true },
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

// Update the current user's currency preference
const updateCurrency = async (req, res) => {
    const { currency } = req.body;
    const allowed = ['USD', 'EUR', 'INR', 'GBP', 'JPY'];
    if (!allowed.includes(currency)) {
        return res.status(400).json({ message: 'Invalid currency' });
    }
    try {
        const user = await prisma.user.update({
            where: { id: req.userId },
            data: { currency },
            select: { id: true, name: true, email: true, currency: true },
        });
        res.json({ user });
    } catch (error) {
        console.error('Error updating currency:', error.message);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const genericMessage = 'If an account exists for that email, a reset link has been sent.';

    if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await prisma.user.findFirst({
            where: { email: { equals: email.trim(), mode: 'insensitive' } },
        });

        if (user) {
            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = hashResetToken(rawToken);

            await prisma.$transaction([
                prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
                prisma.passwordResetToken.create({
                    data: {
                        tokenHash,
                        userId: user.id,
                        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
                    },
                }),
            ]);

            const resetUrl = `${getFrontendUrl()}/reset-password?token=${rawToken}`;
            sendPasswordResetEmail({
                to: user.email,
                resetUrl,
                userName: user.name,
            }).catch((error) => {
                console.error('Failed to send password reset email:', error.message);
            });
        }

        res.json({ message: genericMessage });
    } catch (error) {
        console.error('Forgot password error:', error.message);
        res.status(500).json({ message: 'Unable to send reset email. Please try again later.' });
    }
};

const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        const tokenHash = hashResetToken(token);
        const resetRecord = await prisma.passwordResetToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });

        if (!resetRecord || resetRecord.expiresAt < new Date()) {
            if (resetRecord) {
                await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } });
            }
            return res.status(400).json({ message: 'Invalid or expired reset link' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetRecord.userId },
                data: { password: hashedPassword },
            }),
            prisma.passwordResetToken.deleteMany({ where: { userId: resetRecord.userId } }),
        ]);

        res.json({ message: 'Password updated successfully. You can now sign in.' });
    } catch (error) {
        console.error('Reset password error:', error.message);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

module.exports = { register, login, getMe, updateCurrency, forgotPassword, resetPassword };
