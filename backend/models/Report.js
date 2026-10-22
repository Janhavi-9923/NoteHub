const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      enum: ['irrelevant', 'poor_quality', 'duplicate', 'suspicious', 'incorrect_information', 'copyright_concern'],
      required: true,
    },
    details: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
