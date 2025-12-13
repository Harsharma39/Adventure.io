const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

// Serve React in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
  }
}

// API endpoints
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API test' });
});

// All routes → React
app.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    const indexPath = path.join(__dirname, '../client/build/index.html');
    if (fs.existsSync(indexPath) && !req.path.startsWith('/api/')) {
      return res.sendFile(indexPath);
    }
  }
  res.json({ success: true, message: 'API' });
});

// Vercel export
module.exports = app;
