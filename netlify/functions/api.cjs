const serverless = require('serverless-http');
const app = require('../../server/index.cjs');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
    // Standard Health Check
    if (event.path.endsWith('/health')) {
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ok', environment: 'production' })
        };
    }

    try {
        return await handler(event, context);
    } catch (error) {
        console.error('Function Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'An internal server error occurred' })
        };
    }
};
