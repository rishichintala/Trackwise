const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient(); // Re-enabled
const authRoutes = require('./routes/authRoutes');
const financialRoutes = require('./routes/financialRoutes');

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

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, cb) => {
        // allow same-origin / server-to-server / curl
        if (!origin) return cb(null, true);
        if (corsOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
}));


app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', financialRoutes);

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
