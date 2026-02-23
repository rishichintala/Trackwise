const serverless = require('serverless-http');
const app = require('../../server/index.cjs');

console.log('--- Netlify Function [api] Initialized ---');

// Wrap the Express app in a serverless handler securely
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    try {
        console.log(`--- [api] Function Event Path: ${event.path} ---`);

        // Fast-path Health Check (Bypasses Express for debugging)
        if (event.path === '/api/health' || event.path === '/health') {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ status: 'ok', source: 'function-wrapper', path: event.path })
            };
        }

        return await handler(event, context);
    } catch (error) {
        console.error('--- PRIMARY FUNCTION CRASH ---', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Function Initialization Failed',
                message: error.message,
                stack: error.stack
            })
        };
    }
};
