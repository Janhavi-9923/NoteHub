const User = require('../models/User');
const Note = require('../models/Note');
const { createNotification } = require('./notificationService');

// Badge definitions with configurable-in-code criteria functions.
// Each `check` function returns true/false: "has this user earned this badge?"
const BADGE_DEFINITIONS = [
  {
    key: 'KNOWLEDGE_SHARER',
    name: 'Knowledge Sharer',
    check: async (userId) => (await Note.countDocuments({ owner: userId, status: 'published' })) >= 1,
  },
  {
    key: 'CONSISTENT_CONTRIBUTOR',
    name: 'Consistent Contributor',
    check: async (userId) => (await Note.countDocuments({ owner: userId, status: 'published' })) >= 3,
  },
  {
    key: 'QUALITY_CONTRIBUTOR',
    name: 'Quality Contributor',
    check: async (userId) => {
      const notes = await Note.find({ owner: userId, status: 'published', ratingCount: { $gte: 1 } });
      if (notes.length < 3) return false;
      const avg = notes.reduce((s, n) => s + n.ratingAvg, 0) / notes.length;
      return avg >= 4;
    },
  },
  {
    key: 'HELPFUL_SCHOLAR',
    name: 'Helpful Scholar',
    check: async (userId) => {
      const notes = await Note.find({ owner: userId });
      const totalRatings = notes.reduce((s, n) => s + n.ratingCount, 0);
      return totalRatings >= 10;
    },
  },
  {
    key: 'TOP_CONTRIBUTOR',
    name: 'Top Contributor',
    check: async (userId) => {
      const top3 = await User.find().sort({ points: -1 }).limit(3).select('_id');
      return top3.some((u) => u._id.toString() === userId.toString());
    },
  },
];

async function checkAndAwardBadges(userId) {
  const user = await User.findById(userId);
  if (!user) return;
  const owned = new Set(user.badges.map((b) => b.key));

  for (const def of BADGE_DEFINITIONS) {
    if (owned.has(def.key)) continue;
    const earned = await def.check(userId);
    if (earned) {
      user.badges.push({ key: def.key, name: def.name });
      await createNotification(userId, 'BADGE', `🏅 You earned the "${def.name}" badge!`);
    }
  }
  await user.save();
}

module.exports = { checkAndAwardBadges, BADGE_DEFINITIONS };
