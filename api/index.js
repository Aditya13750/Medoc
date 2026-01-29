// Vercel serverless entry point for your Node.js app
const express = require('express');
const app = express();

// Import your main server logic
const server = require('../src/server');

// Use JSON middleware
app.use(express.json());

// Mount your existing server routes
app.use(server);

// Export as Vercel handler
module.exports = app;
