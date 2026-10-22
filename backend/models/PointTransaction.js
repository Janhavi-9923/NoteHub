const mongoose = require('mongoose');

// Every time points are given, we record WHY (reason), for WHAT (refType/refId),
// and to WHOM. The unique index below is what stops the same event from ever
// awarding points twice (anti-gaming: "duplicate point awards").
const pointTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true }, // e.g. "VERIFIED_UPLOAD", "QUALITY_BONUS", "RECEIVED_RATING"
    refType: { type: String, required: true }, // e.g. "Note", "Review"
    refId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

// Same user + same reason + same reference can never earn points twice.
pointTransactionSchema.index({ user: 1, reason: 1, refType: 1, refId: 1 }, { unique: true });

module.exports = mongoose.model('PointTransaction', pointTransactionSchema);
