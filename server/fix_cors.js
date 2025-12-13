const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// Update CORS to allow localhost:3000
const newCorsConfig = `app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://adventure-io.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
}));`;

// Replace the CORS section
content = content.replace(/app\.use\(cors\([\s\S]*?\)\);/g, newCorsConfig);
fs.writeFileSync('server.js', content);
console.log('✅ CORS configuration updated');
