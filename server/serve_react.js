const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('server.js', 'utf8');

// Add static file serving code before module.exports
const serveReactCode = `

// ============ SERVE REACT BUILD ============
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  
  if (fs.existsSync(buildPath)) {
    // Serve static files from React build
    app.use(express.static(buildPath));
    
    // For any non-API route, serve React app
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(buildPath, 'index.html'));
      }
    });
    
    console.log('✅ Serving React frontend');
  } else {
    console.log('⚠️ React build not found at:', buildPath);
  }
}
`;

// Insert before module.exports
const lines = content.split('\n');
let newContent = [];
let added = false;

for (let line of lines) {
  if (line.includes('module.exports') && !added) {
    newContent.push(serveReactCode);
    newContent.push(line);
    added = true;
  } else {
    newContent.push(line);
  }
}

fs.writeFileSync('server.js', newContent.join('\n'));
console.log('✅ Added React serving code');
