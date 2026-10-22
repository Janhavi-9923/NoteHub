const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/noteController');
const reviewCtrl = require('../controllers/reviewController');
const reportCtrl = require('../controllers/reportController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', ctrl.listNotes);
router.get('/mine/list', protect, ctrl.myNotes);
router.get('/mine/downloads', protect, ctrl.myDownloads);
router.post('/', protect, upload.single('file'), ctrl.uploadNote);
router.get('/:id', optionalAuth, ctrl.getNote);
router.get('/:id/access', protect, ctrl.accessNote);
router.put('/:id', protect, ctrl.updateNote);
router.post('/:id/unpublish', protect, ctrl.unpublishNote);
router.delete('/:id', protect, ctrl.deleteNote);

router.post('/:id/reviews', protect, reviewCtrl.upsertReview);
router.get('/:id/reviews', reviewCtrl.listReviews);

router.post('/:id/report', protect, reportCtrl.createReport);

module.exports = router;
