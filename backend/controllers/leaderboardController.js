const User = require('../models/User');
const PointTransaction = require('../models/PointTransaction');

function toEntry(u, points) {
  return { id: u._id, name: u.name, college: u.college, points, badges: u.badges };
}

exports.overall = async (req, res, next) => {
  try {
    const users = await User.find().sort({ points: -1 }).limit(50).select('name college points badges');
    res.json({ leaderboard: users.map((u) => toEntry(u, u.points)) });
  } catch (err) {
    next(err);
  }
};

exports.monthly = async (req, res, next) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const totals = await PointTransaction.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: '$user', points: { $sum: '$amount' } } },
      { $sort: { points: -1 } },
      { $limit: 50 },
    ]);

    const users = await User.find({ _id: { $in: totals.map((t) => t._id) } }).select('name college badges');
    const map = new Map(users.map((u) => [u._id.toString(), u]));

    res.json({
      leaderboard: totals
        .map((t) => {
          const u = map.get(t._id.toString());
          return u ? toEntry(u, t.points) : null;
        })
        .filter(Boolean),
    });
  } catch (err) {
    next(err);
  }
};
