const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

console.log('🚀 Server starting...');
console.log('Current dir:', __dirname);

// Try multiple possible paths for React build
const possiblePaths = [
  path.join(__dirname, '../client/build'),      // Local structure
  path.join(__dirname, './client/build'),       // Vercel structure
  path.join(process.cwd(), 'client/build'),     // Current working directory
  path.join(process.cwd(), 'build')             // Direct build
];

let buildPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    buildPath = p;
    console.log('✅ Found React build at:', buildPath);
    break;
  }
}

if (buildPath) {
  // Serve static files
  app.use(express.static(buildPath));
  
  // API endpoint
  app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API test' });
  });
  
  // ALL other routes → React
  app.get('*', (req, res) => {
    console.log('📄 Serving index.html for:', req.path);
    res.sendFile(path.join(buildPath, 'index.html'));
  });
  
} else {
  console.log('❌ React build not found. Tried:', possiblePaths);
  
  // Fallback: JSON API
  app.get('/', (req, res) => {
    res.json({ 
      success: true, 
      message: 'API (React build missing)',
      tip: 'Run: cd client && npm run build'
    });
  });
  
  app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API test' });
  });
}

module.exports = app;
