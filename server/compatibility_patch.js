// Node.js 24 compatibility
console.log(`Node.js version: ${process.version}`);

// Ensure certain features work in Node.js 24
if (!global.TextEncoder) {
  global.TextEncoder = require('util').TextEncoder;
}
if (!global.TextDecoder) {
  global.TextDecoder = require('util').TextDecoder;
}
