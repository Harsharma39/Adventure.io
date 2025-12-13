const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// Update MongoDB connection to be more robust
const mongoFix = `// ==================== MONGODB CONNECTION ====================
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.log('⚠️  MONGODB_URI not set. Using mock mode.');
  console.log('💡 Set MONGODB_URI in Vercel Environment Variables');
  
  // Create mock models so app doesn't crash
  const mockModel = {
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    countDocuments: () => Promise.resolve(0),
    save: function() { return Promise.resolve(this); }
  };
  
  // Mock Booking and User models
  global.Booking = mockModel;
  global.User = mockModel;
  
} else {
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('💡 Tips:');
    console.log('1. Check MONGODB_URI in Vercel Environment Variables');
    console.log('2. Whitelist IP 0.0.0.0/0 in MongoDB Atlas Network Access');
    console.log('3. Check username/password in connection string');
    
    // Fallback to mock mode if connection fails
    global.Booking = { find: () => Promise.resolve([]) };
    global.User = { findOne: () => Promise.resolve(null) };
  });
}`;

// Replace the MongoDB connection section
content = content.replace(/\/\/ ==================== MONGODB CONNECTION ====================[\s\S]*?\.catch\(err => console\.error.*?\);/, mongoFix);

fs.writeFileSync('server.js', content);
console.log('✅ MongoDB connection made more robust');
