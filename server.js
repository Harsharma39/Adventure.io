
// Add API base route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Adventure.io API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      bookings: '/api/bookings',
      test: '/api/test',
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});
