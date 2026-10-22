const jwt = require('jsonwebtoken');

// Creates a login token that proves "this request comes from user X".
function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { signToken };
