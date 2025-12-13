// server/server.js - Updated for Vercel deployment
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();

// ==================== VERCEL COMPATIBILITY ====================
const isVercel = process.env.VERCEL === '1';
const isProduction = process.env.NODE_ENV === 'production';

// CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
      'https://adventure-io.vercel.app',
      'https://adventure-io-harsharma39.vercel.app',
      'https://*.vercel.app'
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.some(allowed => origin === allowed) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// ==================== MONGODB CONNECTION ====================
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ==================== SERVE REACT BUILD IN PRODUCTION ====================
if (isProduction) {
  console.log('🚀 Running in production mode');
  const buildPath = path.join(__dirname, '../client/build');
  
  // Check if React build exists
  const fs = require('fs');
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    console.log(`📁 Serving React build from: ${buildPath}`);
  } else {
    console.log('⚠️ React build not found. Make sure to run: cd client && npm run build');
  }
}

// ==================== YOUR EXISTING CODE ====================

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

// Routes

// 1. Health Check
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    success: true,
    message: '✅ Adventure.io Backend API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: isVercel,
    platform: process.platform,
    node: process.version,
    database: dbStatus,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    apiBaseUrl: isVercel ? '/api' : `http://localhost:${process.env.PORT || 5000}/api`
  });
});

// 2. Vercel Status Check
app.get('/api/vercel-status', (req, res) => {
  res.json({
    success: true,
    message: 'Vercel serverless function is working',
    serverless: true,
    region: process.env.VERCEL_REGION || 'unknown',
    lambda: true
  });
});

// 3. Test Route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API endpoint is working!',
    data: { timestamp: new Date().toISOString() }
  });
});

// 4. User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      fullName,
      phone
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. Create Booking (Protected)
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      visitDate,
      ticketType,
      ticketQuantity,
      totalAmount,
      paymentMethod = 'demo'
    } = req.body;
    
    // Generate booking ID
    const bookingId = generateBookingId();
    
    // Create booking
    const booking = new Booking({
      bookingId,
      fullName,
      email,
      phone,
      visitDate: new Date(visitDate),
      ticketType,
      ticketQuantity,
      totalAmount,
      paymentMethod,
      paymentStatus: 'completed',
      emailSent: false,
      smsSent: false
    });
    
    await booking.save();
    
    console.log(`🎫 New booking created: ${bookingId}`);
    console.log(`📧 Email to: ${email}`);
    console.log(`📱 Phone: ${phone}`);
    console.log(`💰 Amount: ₹${totalAmount}`);
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: {
          id: booking._id,
          bookingId: booking.bookingId,
          fullName: booking.fullName,
          email: booking.email,
          phone: booking.phone,
          visitDate: booking.visitDate,
          ticketType: booking.ticketType,
          ticketQuantity: booking.ticketQuantity,
          totalAmount: booking.totalAmount,
          paymentMethod: booking.paymentMethod,
          paymentStatus: booking.paymentStatus,
          createdAt: booking.createdAt
        }
      }
    });
    
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create booking',
      details: error.message 
    });
  }
});

// 7. Get All Bookings (Protected - Admin)
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(100);
    
    res.json({
      success: true,
      data: {
        bookings,
        count: bookings.length
      }
    });
    
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// 8. Get Booking by ID
app.get('/api/bookings/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({
      success: true,
      data: { booking }
    });
    
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// 9. Get User's Bookings (Protected)
app.get('/api/user/bookings', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    const bookings = await Booking.find({ email: userEmail }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: {
        bookings,
        count: bookings.length
      }
    });
    
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
});

// 10. Update Booking Status (Protected - Admin)
app.patch('/api/bookings/:bookingId/status', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentStatus, emailSent, smsSent } = req.body;
    
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Update fields
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (emailSent !== undefined) booking.emailSent = emailSent;
    if (smsSent !== undefined) booking.smsSent = smsSent;
    booking.updatedAt = new Date();
    
    await booking.save();
    
    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking }
    });
    
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// 11. Analytics Endpoint (Protected - Admin)
app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    const monthlyBookings = await Booking.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
    });
    
    res.json({
      success: true,
      data: {
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayBookings,
        monthlyBookings
      }
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// 12. Check Email Availability
app.get('/api/auth/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ email });
    
    res.json({
      success: true,
      data: {
        email,
        available: !user
      }
    });
    
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ error: 'Failed to check email' });
  }
});

// 13. Health Check with DB
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Health check failed' 
    });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== VERCEL/LOCAL SERVER START ====================
if (isVercel) {
  // Vercel Serverless Mode
  console.log('☁️ Running on Vercel Serverless Functions');
  module.exports = app;
} else {
  // Local Development Mode
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`✅ Server successfully started on port ${PORT}`);
    console.log(`🌐 Open your browser to: http://localhost:${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Working directory: ${__dirname}`);
  });
}