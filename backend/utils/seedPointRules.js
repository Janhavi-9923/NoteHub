// Run this once with:  npm run seed
// It fills the database with default point values (editable later in MongoDB).
require('dotenv').config();
const mongoose = require('mongoose');
const PointRule = require('../models/PointRule');

const defaults = [
  { key: 'VERIFIED_UPLOAD', points: 10, description: 'Note passed AI verification and was published' },
  { key: 'QUALITY_BONUS_LOW', points: 5, description: 'Extra bonus for decent quality score' },
  { key: 'QUALITY_BONUS_HIGH', points: 15, description: 'Extra bonus for high quality score' },
  { key: 'RECEIVED_RATING', points: 2, description: 'Someone rated/reviewed your note' },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const rule of defaults) {
    await PointRule.updateOne({ key: rule.key }, { $set: rule }, { upsert: true });
  }
  console.log('✅ Point rules seeded:', defaults.map((d) => d.key).join(', '));
  process.exit(0);
})();
