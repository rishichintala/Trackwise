const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient(); // Re-enabled
const authRoutes = require('./routes/authRoutes.cjs');
const financialRoutes = require('./routes/financialRoutes.cjs');

// Netlify Path-Stripping Middleware
// Netlify proxies /api/* to /.netlify/functions/api/health
// We need to strip the internal prefix so Express routes match correctly.
app.use((req, res, next) => {
    const internalPrefix = '/.netlify/functions/api';
    if (req.url.startsWith(internalPrefix)) {
        req.url = req.url.replace(internalPrefix, '');
    }
    // Also handle cases where the proxy might leave a double /api
    if (req.url.startsWith('/api/api')) {
        req.url = req.url.replace('/api/api', '/api');
    }
    next();
});

// High-Priority Health Check (Matches before any other routes)
app.get('/health', (req, res) => res.json({ status: 'ok', netlify: process.env.NETLIFY }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', netlify: process.env.NETLIFY }));

async function connectDB() {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed. Check your DATABASE_URL environment variable in Netlify.', error);
        // Do not process.exit(1) in serverless environments
    }
}
connectDB();

// CORS configuration
if (process.env.NETLIFY === 'true') {
    // In Netlify, we allow all origins for now to ensure the API is reachable
    app.use(cors({ origin: true, credentials: true }));
} else {
    const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    app.use(cors({
        origin: (origin, cb) => {
            if (!origin) return cb(null, true);
            if (corsOrigins.includes(origin)) return cb(null, true);
            return cb(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true
    }));
}


app.use(express.json());

// Diagnostic log for Netlify environment
if (process.env.NETLIFY === 'true') {
    console.log('--- Netlify Runtime Detected ---');
    app.use((req, res, next) => {
        console.log(`[${req.method}] ${req.url}`);
        next();
    });
}

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', netlify: process.env.NETLIFY }));
app.get('/health', (req, res) => res.json({ status: 'ok', netlify: process.env.NETLIFY }));

// Routes
// We mount on both /api and / to handle the difference between local port 8000
// and Netlify's redirect which strips the /api prefix.
const mainRouter = express.Router();
mainRouter.use('/auth', authRoutes);
mainRouter.use('/', financialRoutes);

app.use('/api', mainRouter);
app.use('/', mainRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ message: 'An internal server error occurred' });
});

if (process.env.NETLIFY !== 'true') {
    const PORT = process.env.PORT || 5001;
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    process.on('exit', (code) => {
        console.log(`About to exit with code: ${code}`);
    });

    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('SIGTERM', () => {
        console.log('SIGTERM received. Closing server...');
        server.close(() => {
            console.log('Server closed.');
            prisma.$disconnect()
                .catch((e) => console.error('Error disconnecting Prisma:', e))
                .finally(() => process.exit(0));
        });
    });

    // Prevent Node from exiting prematurely due to dependency unref bugs during local dev
    setInterval(() => { }, 1000 * 60 * 60);
}

// Export the app for Netlify Serverless Functions wrapper
module.exports = app;
