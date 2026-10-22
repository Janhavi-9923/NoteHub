const mongoose = require('mongoose');

// Configurable point values, so we never hard-code numbers around the app.
const pointRuleSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. "VERIFIED_UPLOAD"
  points: { type: Number, required: true },
  description: { type: String, default: '' },
});

module.exports = mongoose.model('PointRule', pointRuleSchema);
