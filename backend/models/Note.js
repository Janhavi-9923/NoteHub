const mongoose = require('mongoose');

// A "Note" is one uploaded academic note (a PDF/JPG/PNG file + metadata).
const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    topic: { type: String, trim: true },
    semester: { type: String, trim: true },
    college: { type: String, trim: true },
    course: { type: String, trim: true },
    branch: { type: String, trim: true },
    professor: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    tags: [{ type: String, trim: true }],

    declarationAccepted: { type: Boolean, required: true },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    fileName: { type: String, required: true },   // name stored on disk
    originalFileName: { type: String, required: true },
    fileType: { type: String, required: true },   // pdf | jpg | jpeg | png
    fileSize: { type: Number, required: true },    // bytes
    fileHash: { type: String, required: true, index: true }, // SHA-256 of file contents

    status: {
      type: String,
      enum: ['processing', 'published', 'needs_improvement', 'rejected', 'unpublished'],
      default: 'processing',
    },

    ai: {
      status: { type: String, enum: ['pending', 'passed', 'needs_improvement', 'failed'], default: 'pending' },
      provider: { type: String, default: 'mock' },
      qualityScore: { type: Number, default: 0 }, // 0-100
      isAcademic: { type: Boolean, default: true },
      isDuplicateExact: { type: Boolean, default: false },
      isDuplicateNear: { type: Boolean, default: false },
      duplicateOfNoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', default: null },
      detectedSubject: { type: String, default: '' },
      extractedKeywords: [{ type: String }],
      reasons: [{ type: String }],
      suggestions: [{ type: String }],
      processedAt: { type: Date },
    },

    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

noteSchema.index({ title: 'text', subject: 'text', topic: 'text', tags: 'text', description: 'text' });

module.exports = mongoose.model('Note', noteSchema);
