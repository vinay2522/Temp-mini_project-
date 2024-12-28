const crypto = require('crypto');

// Generate a random 256-bit (32-byte) secret key
const JWT_SECRET = crypto.randomBytes(32).toString('hex');

console.log('Your JWT Secret Key:', JWT_SECRET);