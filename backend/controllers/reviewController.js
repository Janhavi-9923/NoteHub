const Review = require('../models/Review');
const Note = require('../models/Note');
const NoteAccess = require('../models/NoteAccess');
const pointsService = require('../services/pointsService');
const { createNotification } = require('../services/notificationService');

async function recalcNoteRating(noteId) {
  const reviews = await Review.find({ note: noteId });
  const count = reviews.length;
  const avg = count === 0 ? 0 : reviews.reduce((s, r) => s + r.rating, 0) / count;
  await Note.findByIdAndUpdate(noteId, { ratingAvg: Math.round(avg * 10) / 10, ratingCount: count });
}

// POST /api/notes/:id/reviews  — create OR update the user's own review (upsert)
exports.upsertReview = async (req, res, next) => {
  try {
    const { rating, text } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note || note.status !== 'published') return res.status(404).json({ message: 'Note not found.' });

    if (note.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot review your own note.' });
    }

    // Anti-gaming: must have genuinely accessed the note first.
    const accessed = await NoteAccess.findOne({ note: note._id, user: req.user._id });
    if (!accessed) {
      return res.status(400).json({ message: 'You must access/download this note before reviewing it.' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const review = await Review.findOneAndUpdate(
      { note: note._id, user: req.user._id },
      { rating, text: text || '' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await recalcNoteRating(note._id);

    // Award points to the note owner (deduped per review, so editing a
    // review does not award points again).
    await pointsService.award(note.owner, 'RECEIVED_RATING', 'Review', review._id);
    await createNotification(note.owner, 'RATING', `${req.user.name} rated your note "${note.title}" ${rating}★.`, `/notes/${note._id}`);

    res.json({ review });
  } catch (err) {
    next(err);
  }
};

exports.listReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ note: req.params.id }).sort({ createdAt: -1 }).populate('user', 'name');
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};
