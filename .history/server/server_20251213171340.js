const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();

// ==================== VERCEL-SPECIFIC CONFIGURATION ====================
const isVercel = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// CORS Configuration for Vercel
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      frontendUrl,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://adventure-io.vercel.app',
      'https://*.vercel.app',
      'https://adventure-io-harsharma39.vercel.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// ==================== MONGODB CONNECTION ====================
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  console.log('💡 For Vercel: Add MONGODB_URI in Settings > Environment Variables');
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('💡 If using MongoDB Atlas: Whitelist IP 0.0.0.0/0 in Network Access');
});

// ==================== SERVE REACT BUILD IN PRODUCTION ====================
if (isProduction) {
  console.log('🚀 Running in production mode');
  
  // Serve static files from React build
  const buildPath = path.join(__dirname, '../client/build');
  
  if (require('fs').existsSync(buildPath)) {
    app.use(express.static(buildPath));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      // Don't serve API routes as static files
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      res.sendFile(path.join(buildPath, 'index.html'));
    });
    
    console.log(`📁 Serving React build from: ${buildPath}`);
  } else {
    console.log('⚠️  React build not found. Run: npm run build in client/');
  }
} else {
  console.log('🔧 Running in development mode');
}

// ==================== YOUR EXISTING CODE ====================
// (Keep ALL your existing schemas and routes here - I'll show the modified parts)

// MongoDB Schemas
const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  visitDate: { type: Date, required: true },
  ticketType: { type: String, required: true },
  ticketQuantity: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  emailSent: { type: Boolean, default: false },
  smsSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// MongoDB Models
const Booking = mongoose.model('Booking', bookingSchema);
const User = mongoose.model('User', userSchema);

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate booking ID
const generateBookingId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `ADV${timestamp}${random}`;
};

// ==================== MODIFIED ROUTES FOR VERCEL ====================

// 1. Health Check (Enhanced for Vercel)
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    success: true,
    message: '✅ Adventure.io Backend API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: isVercel ? 'true' : 'false',
    platform: process.platform,
    node: process.version,
    database: dbStatus,
    frontendUrl: frontendUrl,
    apiBaseUrl: isVercel ? '/api' : `http://localhost:${process.env.PORT || 5000}/api`
  });
});

// 2. Add this IMPORTANT route for Vercel serverless compatibility
app.get('/api/vercel-status', (req, res) => {
  res.json({
    success: true,
    message: 'Vercel serverless function is working',
    serverless: true,
    region: process.env.VERCEL_REGION || 'unknown',
    lambda: true
  });
});

// KEEP ALL YOUR EXISTING ROUTES EXACTLY AS THEY ARE:
// /api/test, /api/auth/register, /api/auth/login, /api/bookings, etc.
// ... (ALL your routes from line 80-350 remain unchanged)

// ==================== SERVER STARTUP ====================
// Vercel Serverless functions don't use app.listen()
// They export the app instead

if (isVercel) {
  // Vercel Serverless Mode
  console.log('☁️  Running on Vercel Serverless Functions');
  module.exports = app;
} else {
  // Local Development Mode
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server successfully started on port ${PORT}`);
    console.log(`🌐 Open your browser to: http://localhost:${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🔗 Frontend URL: ${frontendUrl}`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Working directory: ${__dirname}`);
  });
}
