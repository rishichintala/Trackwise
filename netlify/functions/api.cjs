const serverless = require('serverless-http');
const app = require('../../server/index.cjs');

console.log('--- Netlify Function [api] Initialized ---');

// Wrap the Express app in a serverless handler securely
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    console.log(`--- Function [api] Request: ${event.path} ---`);
    return await handler(event, context);
};
