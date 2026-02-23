const serverless = require('serverless-http');
const app = require('../../server/index.cjs');

console.log('--- Netlify Function [api] Initialized ---');

// Wrap the Express app in a serverless handler securely
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    console.log(`--- [api] Function Event Path: ${event.path} ---`);
    console.log(`--- [api] Function Method: ${event.httpMethod} ---`);
    return await handler(event, context);
};
