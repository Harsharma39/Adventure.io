const express = require('express');
const app = express();

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: '🚀 Adventure.io API',
    endpoints: ['/api/test', '/api/health'],
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'healthy' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
});

// ============ SERVE REACT IN PRODUCTION ============
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const fs = require('fs');
  const buildPath = path.join(__dirname, '../client/build');
  
  if (fs.existsSync(buildPath)) {
    const express = require('express');
    app.use(express.static(buildPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
    console.log('✅ Serving React build');
  }
}

// ============ VERCEL/LOCAL START ============
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`✅ Server: http://localhost:${PORT}`);
  });
}
