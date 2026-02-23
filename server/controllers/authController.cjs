const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const register = async (req, res) => {
    const { name, email, password } = req.body;
    console.log(`--- [Register] Email: ${email || 'NONE'} ---`);

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Missing fields', fields: { name: !!name, email: !!email, pass: !!password } });
    }

    try {
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        console.log('--- Step: Hashing ---');
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('--- Step: DB Create ---');
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });

        console.log('--- Step: JWT ---');
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        console.log('✅ Registered');
        res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, token });
    } catch (error) {
        console.error('Registration Crash:', error);
        res.status(500).json({
            message: 'Registration failed',
            error: error.message,
            stack: process.env.NETLIFY === 'true' ? undefined : error.stack
        });
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
        console.error('Login error:', error);
        res.status(500).json({
            message: 'An internal server error occurred',
            error: error.message
        });
    }
};

module.exports = { register, login };
