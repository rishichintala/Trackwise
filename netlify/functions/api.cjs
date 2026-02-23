const serverless = require('serverless-http');
const app = require('../../server/index');

console.log('--- Netlify Function [api] Initialized ---');

// Wrap the Express app in a serverless handler securely
module.exports.handler = serverless(app);
