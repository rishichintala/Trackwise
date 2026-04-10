const { PrismaClient } = require('@prisma/client');

// Reuse a single PrismaClient instance across all modules.
// In serverless environments each function invocation may share the same
// Node.js process, so instantiating PrismaClient in every file quickly
// exhausts the database connection pool.
const prisma = global._prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') global._prisma = prisma;

module.exports = prisma;
