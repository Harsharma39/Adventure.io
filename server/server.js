const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Find React build
const findReactBuild = () => {
  const paths = [
    path.join(__dirname, '../client/build'),
    path.join(process.cwd(), 'client/build'),
    path.join(process.cwd(), 'build')
  ];
  for (const p of paths) {
    if (fs.existsSync(path.join(p, 'index.html'))) {
      return p;
    }
  }
  return null;
};

const buildPath = findReactBuild();

if (buildPath) {
  console.log('Serving React from:', buildPath);
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  console.log('No React build found');
  app.get('/', (req, res) => {
    res.json({ error: 'React build missing' });
  });
}

// API (will be caught by * route unless /api/)
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API' });
});

module.exports = app;
