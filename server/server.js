const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const buildPath = path.join(__dirname, '../client/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API' });
  });
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ error: 'No React build' });
  });
}
module.exports = app;
