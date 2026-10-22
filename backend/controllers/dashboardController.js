const Note = require('../models/Note');
const Review = require('../models/Review');
const PointTransaction = require('../models/PointTransaction');
const User = require('../models/User');

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const notes = await Note.find({ owner: userId });
    const published = notes.filter((n) => n.status === 'published');
    const totalViews = notes.reduce((s, n) => s + n.views, 0);
    const totalDownloads = notes.reduce((s, n) => s + n.downloads, 0);
    const avgRating =
      published.length === 0 ? 0 : published.reduce((s, n) => s + n.ratingAvg, 0) / published.length;

    const recentUploads = [...notes].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

    const recentReviews = await Review.find({ note: { $in: notes.map((n) => n._id) } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .populate('note', 'title');

    const pointHistory = await PointTransaction.find({ user: userId }).sort({ createdAt: -1 }).limit(10);

    const allUsersSorted = await User.find().sort({ points: -1 }).select('_id');
    const rank = allUsersSorted.findIndex((u) => u._id.toString() === userId.toString()) + 1;

    const topLeaderboard = await User.find().sort({ points: -1 }).limit(5).select('name points');

    res.json({
      stats: {
        totalUploads: notes.length,
        totalPublished: published.length,
        totalViews,
        totalDownloads,
        avgRating: Math.round(avgRating * 10) / 10,
        points: req.user.points,
        rank: rank || null,
      },
      badges: req.user.badges,
      recentUploads,
      recentReviews,
      pointHistory,
      leaderboardSnapshot: topLeaderboard,
    });
  } catch (err) {
    next(err);
  }
};
