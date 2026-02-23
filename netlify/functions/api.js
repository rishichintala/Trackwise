const serverless = require('serverless-http');

// Note: We don't require('app') at the top level to ensure the health check 
// can respond even if the database/app-load crashes.
let app;
let handler;

module.exports.handler = async (event, context) => {
    try {
        console.log(`--- [api] Request Path: ${event.path} ---`);

        // Fast-path Health Check
        // Matches: /api/health, /health, or internal Netlify paths ending in these
        if (event.path.endsWith('/health')) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({
                    status: 'ok',
                    source: 'function-wrapper',
                    path: event.path,
                    time: new Date().toISOString()
                })
            };
        }

        // Lazy-load the app and handler
        if (!app) {
            console.log('--- Loading Express App ---');
            app = require('../../server/index.cjs');
            handler = serverless(app);
        }

        return await handler(event, context);
    } catch (error) {
        console.error('--- FUNCTION EXECUTION FAILED ---', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                error: 'Function Execution Failed',
                message: error.message,
                path: event.path,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};
