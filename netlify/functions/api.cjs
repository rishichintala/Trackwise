const serverless = require('serverless-http');
const app = require('../../server/index.cjs');

console.log('--- [api.cjs] FUNCTION STARTING ---');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
    // Proactive Health Check (Verifies Routing + Function + Database)
    if (event.path.endsWith('/health')) {
        console.log('--- [api.cjs] Health Check Triggered ---');
        let dbStatus = "Checking...";
        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            await prisma.$queryRaw`SELECT 1`;
            dbStatus = "Connected";
            await prisma.$disconnect();
        } catch (e) {
            dbStatus = "Connection Failed: " + e.message;
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                status: 'ok',
                source: 'api.cjs-wrapper',
                database: dbStatus,
                userTable: await (async () => {
                    try {
                        const { PrismaClient } = require('@prisma/client');
                        const prisma = new PrismaClient();
                        await prisma.user.count();
                        await prisma.$disconnect();
                        return "Ready";
                    } catch (e) {
                        return "Error: " + e.message;
                    }
                })(),
                jwtSecret: process.env.JWT_SECRET ? "Defined" : "MISSING",
                path: event.path
            })
        };
    }

    try {
        console.log(`--- [api.cjs] Request: [${event.httpMethod}] ${event.path} ---`);
        return await handler(event, context);
    } catch (error) {
        console.error('--- [api.cjs] CRASHED ---', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server Error', message: error.message })
        };
    }
};
