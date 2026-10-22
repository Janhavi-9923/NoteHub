const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { signToken } = require('../utils/tokens');

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    college: user.college,
    course: user.course,
    branch: user.branch,
    semester: user.semester,
    points: user.points,
    badges: user.badges,
  };
}

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, college, course, branch, semester } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, college, course, branch, semester });
    const token = signToken(user._id);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid email or password.' });

    const token = signToken(user._id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

// Simplified for local dev: instead of emailing a reset link, we return the
// reset token in the response so you can test the flow without a mail service.
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
    if (!user) return res.json({ message: 'If that email exists, a reset link has been generated.' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 minutes
    await user.save();

    res.json({
      message: 'Reset token generated (in production this would be emailed to you).',
      devResetToken: token,
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Reset token is invalid or has expired.' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password has been reset. You can now log in.' });
  } catch (err) {
    next(err);
  }
};
