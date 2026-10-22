const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');
const PointRule = require('../models/PointRule');
const { checkAndAwardBadges } = require('./badgeService');
const { createNotification } = require('./notificationService');

// Default point values used if the database has no PointRule saved yet
// (so the app works even before you run `npm run seed`).
const FALLBACK_RULES = {
  VERIFIED_UPLOAD: 10,
  QUALITY_BONUS_LOW: 5,
  QUALITY_BONUS_HIGH: 15,
  RECEIVED_RATING: 2,
};

async function getPoints(key) {
  const rule = await PointRule.findOne({ key });
  return rule ? rule.points : FALLBACK_RULES[key] || 0;
}

/*
  award() is the ONLY way points are ever given in NoteHub.
  It is called from the server, never triggered directly from the frontend.

  Anti-gaming protection: (user, reason, refType, refId) has a UNIQUE index
  on PointTransaction, so the exact same event can never award points twice —
  even if this function gets called twice by accident (e.g. a duplicate request).
*/
async function award(userId, reason, refType, refId, amountOverride) {
  const amount = amountOverride ?? (await getPoints(reason));
  if (!amount) return null;

  try {
    const tx = await PointTransaction.create({ user: userId, amount, reason, refType, refId });
    await User.findByIdAndUpdate(userId, { $inc: { points: amount } });
    await createNotification(userId, 'POINTS', `You earned ${amount} points (${reason.replaceAll('_', ' ').toLowerCase()}).`);
    await checkAndAwardBadges(userId);
    return tx;
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error = points for this exact event were already awarded. Silently ignore.
      return null;
    }
    throw err;
  }
}

module.exports = { award, getPoints };
