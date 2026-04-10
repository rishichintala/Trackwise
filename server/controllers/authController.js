const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, token });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
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
        res.status(500).json({ message: 'Error logging in', error: error.message });
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

module.exports = { register, login, getMe, updateCurrency };
