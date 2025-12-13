const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

console.log('=== SERVER START ===');
console.log('Current dir:', __dirname);
console.log('CWD:', process.cwd());

// Try EVERY possible path
const searchPaths = [
  // Local development
  path.join(__dirname, '../client/build'),
  path.join(__dirname, '..', 'client', 'build'),
  
  // Vercel deployment
  path.join(process.cwd(), 'client', 'build'),
  path.join(process.cwd(), 'build'),
  path.join('/', 'var', 'task', 'client', 'build'),
  path.join('/', 'var', 'task', 'build'),
];

console.log('Searching for React build...');
let buildPath = null;
let foundIndexHtml = null;

for (const searchPath of searchPaths) {
  const indexPath = path.join(searchPath, 'index.html');
  console.log(`Checking: ${searchPath}`);
  
  if (fs.existsSync(indexPath)) {
    buildPath = searchPath;
    foundIndexHtml = indexPath;
    console.log(`✅ FOUND: ${indexPath}`);
    break;
  }
}

if (buildPath && foundIndexHtml) {
  console.log(`📁 Serving React from: ${buildPath}`);
  
  // Serve static files
  app.use(express.static(buildPath));
  
  // API route
  app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API test' });
  });
  
  // ALL routes → React
  app.get('*', (req, res) => {
    console.log(`📄 Serving React for: ${req.path}`);
    res.sendFile(foundIndexHtml);
  });
  
} else {
  console.log('❌ React build NOT found in any location');
  
  // Create a simple HTML response as fallback
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Adventure.io</title></head>
      <body>
        <h1>🚀 Adventure.io</h1>
        <p>React build not found. Building...</p>
        <script>
          setTimeout(() => location.reload(), 3000);
        </script>
      </body>
      </html>
    `);
  });
  
  app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API (React building)' });
  });
}

module.exports = app;
