const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This middleware checks: "Is there a valid login token on this request?"
// If yes, it attaches the logged-in user to req.user and lets the request continue.
// If no, it blocks the request with a 401 (Unauthorized) error.
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ message: 'Not logged in. Please log in first.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired login token.' });
  }
}

// Like protect(), but does not block the request if there's no token —
// it just attaches req.user if a valid token happens to be present.
async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-passwordHash');
      if (user) req.user = user;
    }
  } catch (err) {
    // ignore invalid token for optional auth
  }
  next();
}

module.exports = { protect, optionalAuth };
