const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

// ============ SERVE REACT IN PRODUCTION ============
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  
  if (fs.existsSync(buildPath)) {
    // Serve static files from React build
    app.use(express.static(buildPath));
    console.log('✅ Serving React build from:', buildPath);
  }
}

// API endpoints (will still work)
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API test endpoint' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'healthy' });
});

// Root route - serve React or API info
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    // In production, React handles this route
    const buildPath = path.join(__dirname, '../client/build/index.html');
    if (fs.existsSync(buildPath)) {
      return res.sendFile(buildPath);
    }
  }
  // Fallback: API info
  res.json({ 
    success: true, 
    message: 'Adventure.io',
    frontend: process.env.NODE_ENV === 'production' ? 'React should load' : 'Development mode'
  });
});

// For client-side routing in React
app.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'production' && !req.path.startsWith('/api/')) {
    const buildPath = path.join(__dirname, '../client/build/index.html');
    if (fs.existsSync(buildPath)) {
      return res.sendFile(buildPath);
    }
  }
  // API 404 for undefined routes
  res.status(404).json({ error: 'Not found' });
});

// ============ VERCEL EXPORT ============
module.exports = app;

// Local development
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Local: http://localhost:${PORT}`);
  });
}
