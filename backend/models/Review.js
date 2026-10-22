const mongoose = require('mongoose');

// One rating+review a student leaves on a note. Only ONE active review per user/note.
const reviewSchema = new mongoose.Schema(
  {
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

// A user can only have ONE review per note (enforced at the database level).
reviewSchema.index({ note: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
