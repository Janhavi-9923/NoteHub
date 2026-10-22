const mongoose = require('mongoose');

// A "User" is a student account. There is only ONE role in NoteHub: student.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    college: { type: String, default: '' },
    course: { type: String, default: '' },
    branch: { type: String, default: '' },
    semester: { type: String, default: '' },

    points: { type: Number, default: 0 },
    badges: [
      {
        key: { type: String },       // e.g. "KNOWLEDGE_SHARER"
        name: { type: String },      // e.g. "Knowledge Sharer"
        awardedAt: { type: Date, default: Date.now },
      },
    ],

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
