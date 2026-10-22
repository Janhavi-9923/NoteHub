const crypto = require('crypto');

// SHA-256 fingerprint of a file's exact bytes. Two files with the same
// fingerprint are byte-for-byte identical -> used for exact duplicate detection.
function sha256OfBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

module.exports = { sha256OfBuffer };
