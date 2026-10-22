const Report = require('../models/Report');
const Note = require('../models/Note');

exports.createReport = async (req, res, next) => {
  try {
    const { reason, details } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    const validReasons = ['irrelevant', 'poor_quality', 'duplicate', 'suspicious', 'incorrect_information', 'copyright_concern'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ message: 'Invalid report reason.' });
    }

    const report = await Report.create({ note: note._id, reporter: req.user._id, reason, details });
    res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
};
