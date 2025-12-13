const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// API endpoints
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Adventure.io API',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API test working' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'healthy' });
});

// ============ VERCEL EXPORT ============
// This is REQUIRED for Vercel
module.exports = app;

// Local development only
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Local: http://localhost:${PORT}`);
  });
}
