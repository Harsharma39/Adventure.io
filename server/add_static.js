const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('server.js', 'utf8');

// Add after MongoDB connection (around line 40)
const staticCode = `
// ==================== SERVE REACT BUILD ====================
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(buildPath, 'index.html'));
      }
    });
    
    console.log('✅ Serving React build in production');
  }
}
`;

// Find where to insert (after MongoDB connection)
const lines = content.split('\n');
let newLines = [];
let inserted = false;

for (let line of lines) {
  newLines.push(line);
  if (line.includes('MongoDB connected') && !inserted) {
    newLines.push(staticCode);
    inserted = true;
  }
}

fs.writeFileSync('server.js', newLines.join('\n'));
console.log('✅ Added static file serving to server.js');
