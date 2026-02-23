const serverless = require('serverless-http');
const app = require('../../server/index.cjs');

console.log('--- [api.cjs] FUNCTION STARTING ---');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
    // Immediate health check response to bypass all middleware/app logic
    if (event.path.endsWith('/health')) {
        console.log('--- [api.cjs] Health Check Triggered ---');
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                status: 'ok',
                source: 'api.cjs-wrapper',
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
