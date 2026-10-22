const mongoose = require('mongoose');

// Records that a user genuinely opened/downloaded a note.
// We require an access record to exist before letting someone review a note,
// and we use this to power the "My Downloads" page.
const noteAccessSchema = new mongoose.Schema(
  {
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

noteAccessSchema.index({ note: 1, user: 1 });

module.exports = mongoose.model('NoteAccess', noteAccessSchema);
