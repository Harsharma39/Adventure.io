const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// ============ SERVE REACT ============
// Always try to serve React files first
const buildPath = path.join(__dirname, '../client/build');

if (fs.existsSync(buildPath)) {
  console.log('📁 Found React build at:', buildPath);
  
  // 1. Serve static files (CSS, JS, images)
  app.use(express.static(buildPath));
  
  // 2. API endpoints (must come BEFORE the * route)
  app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API test' });
  });
  
  // 3. ALL OTHER ROUTES → React index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
  
} else {
  console.log('⚠️ No React build found at:', buildPath);
  
  // Fallback: just API
  app.get('/', (req, res) => {
    res.json({ error: 'React build not found' });
  });
  
  app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API only' });
  });
}

// ============ VERCEL ============
module.exports = app;
