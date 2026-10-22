const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // AI_RESULT, PUBLISHED, RATING, REVIEW, POINTS, BADGE, REPORT
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' }, // e.g. /notes/<id>
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
