const fs = require('fs');
const path = require('path');
const Note = require('../models/Note');
const NoteAccess = require('../models/NoteAccess');
const { sha256OfBuffer } = require('../utils/hash');
const aiService = require('../services/aiService');
const pointsService = require('../services/pointsService');
const { createNotification } = require('../services/notificationService');

// Runs the AI pipeline on a note and updates it with the result.
// Awards points automatically if the note is published.
async function runAIAndSave(note, filePath) {
  const result = await aiService.processNote(note, filePath);

  note.ai = {
    status: result.status,
    provider: result.provider,
    qualityScore: result.qualityScore,
    isAcademic: result.isAcademic,
    isDuplicateExact: note.ai?.isDuplicateExact || false,
    isDuplicateNear: result.isDuplicateNear,
    duplicateOfNoteId: result.duplicateOfNoteId,
    detectedSubject: result.detectedSubject,
    extractedKeywords: result.extractedKeywords,
    reasons: result.reasons,
    suggestions: result.suggestions,
    processedAt: new Date(),
  };

  if (note.ai.isDuplicateExact) {
    note.status = 'needs_improvement';
  } else if (result.status === 'passed') {
    note.status = 'published';
  } else if (result.status === 'needs_improvement') {
    note.status = 'needs_improvement';
  } else {
    note.status = 'rejected';
  }

  await note.save();

  if (note.status === 'published') {
    await pointsService.award(note.owner, 'VERIFIED_UPLOAD', 'Note', note._id);
    const bonusReason = result.qualityScore >= 80 ? 'QUALITY_BONUS_HIGH' : result.qualityScore >= 60 ? 'QUALITY_BONUS_LOW' : null;
    if (bonusReason) await pointsService.award(note.owner, bonusReason, 'Note', note._id);
    await createNotification(note.owner, 'PUBLISHED', `Your note "${note.title}" was published! 🎉`, `/notes/${note._id}`);
  } else if (note.status === 'needs_improvement') {
    await createNotification(note.owner, 'AI_RESULT', `Your note "${note.title}" needs improvement before it can be published.`, `/notes/${note._id}`);
  } else if (note.status === 'rejected') {
    await createNotification(note.owner, 'AI_RESULT', `Your note "${note.title}" could not be verified as academic content.`, `/notes/${note._id}`);
  }

  return note;
}

exports.uploadNote = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'A file (PDF/JPG/JPEG/PNG) is required.' });

    const { title, subject, topic, semester, college, course, branch, professor, description, tags, declarationAccepted } = req.body;

    if (declarationAccepted !== 'true' && declarationAccepted !== true) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'You must accept the originality declaration to upload.' });
    }
    if (!title || !subject) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Title and subject are required.' });
    }

    const buffer = fs.readFileSync(req.file.path);
    const fileHash = sha256OfBuffer(buffer);

    // Exact duplicate check via SHA-256 file hash.
    const exactDup = await Note.findOne({ fileHash, status: 'published' });

    const note = await Note.create({
      title,
      subject,
      topic,
      semester,
      college,
      course,
      branch,
      professor,
      description,
      tags: tags ? String(tags).split(',').map((t) => t.trim()).filter(Boolean) : [],
      declarationAccepted: true,
      owner: req.user._id,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      fileType: path.extname(req.file.originalname).replace('.', '').toLowerCase(),
      fileSize: req.file.size,
      fileHash,
      status: 'processing',
      ai: exactDup ? { isDuplicateExact: true, duplicateOfNoteId: exactDup._id, reasons: [`This exact file already exists as "${exactDup.title}".`] } : {},
    });

    await runAIAndSave(note, req.file.path);

    res.status(201).json({ note });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
};

// GET /api/notes  — search + filter + sort (public: published notes only)
exports.listNotes = async (req, res, next) => {
  try {
    const { q, subject, semester, branch, college, minRating, sort = 'newest', page = 1, limit = 12, aiVerified } = req.query;

    const filter = { status: 'published' };
    if (subject) filter.subject = subject;
    if (semester) filter.semester = semester;
    if (branch) filter.branch = branch;
    if (college) filter.college = college;
    if (minRating) filter.ratingAvg = { $gte: Number(minRating) };
    if (aiVerified === 'true') filter['ai.status'] = 'passed';
    if (q) filter.$text = { $search: q };

    let sortSpec = { createdAt: -1 };
    if (sort === 'downloads') sortSpec = { downloads: -1 };
    if (sort === 'rating') sortSpec = { ratingAvg: -1 };
    if (sort === 'views') sortSpec = { views: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [notes, total] = await Promise.all([
      Note.find(filter).sort(sortSpec).skip(skip).limit(Number(limit)).populate('owner', 'name'),
      Note.countDocuments(filter),
    ]);

    res.json({ notes, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

exports.getNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id).populate('owner', 'name college');
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    // Only the owner can view a note that isn't published yet.
    const isOwner = req.user && note.owner._id.toString() === req.user._id.toString();
    if (note.status !== 'published' && !isOwner) {
      return res.status(403).json({ message: 'This note is not published yet.' });
    }

    if (!isOwner) {
      note.views += 1;
      await note.save();
    }
    res.json({ note });
  } catch (err) {
    next(err);
  }
};

// Records a real access/download and serves the file. Requires login.
exports.accessNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note || note.status !== 'published') return res.status(404).json({ message: 'Note not found.' });

    await NoteAccess.findOneAndUpdate(
      { note: note._id, user: req.user._id },
      { note: note._id, user: req.user._id },
      { upsert: true, setDefaultsOnInsert: true }
    );

    note.downloads += 1;
    await note.save();

    const filePath = path.join(__dirname, '..', 'uploads', note.fileName);
    res.download(filePath, note.originalFileName);
  } catch (err) {
    next(err);
  }
};

exports.myNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ notes });
  } catch (err) {
    next(err);
  }
};

exports.updateNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own notes.' });
    }
    const editable = ['title', 'subject', 'topic', 'semester', 'college', 'course', 'branch', 'professor', 'description'];
    for (const field of editable) {
      if (req.body[field] !== undefined) note[field] = req.body[field];
    }
    if (req.body.tags !== undefined) {
      note.tags = String(req.body.tags).split(',').map((t) => t.trim()).filter(Boolean);
    }
    await note.save();
    res.json({ note });
  } catch (err) {
    next(err);
  }
};

exports.unpublishNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only unpublish your own notes.' });
    }
    note.status = 'unpublished';
    await note.save();
    res.json({ note });
  } catch (err) {
    next(err);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    if (note.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own notes.' });
    }
    const filePath = path.join(__dirname, '..', 'uploads', note.fileName);
    fs.unlink(filePath, () => {});
    await note.deleteOne();
    res.json({ message: 'Note deleted.' });
  } catch (err) {
    next(err);
  }
};

exports.myDownloads = async (req, res, next) => {
  try {
    const accesses = await NoteAccess.find({ user: req.user._id }).sort({ createdAt: -1 }).populate({
      path: 'note',
      populate: { path: 'owner', select: 'name' },
    });
    res.json({ accesses });
  } catch (err) {
    next(err);
  }
};
