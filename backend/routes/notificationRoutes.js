const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, ctrl.list);
router.post('/:id/read', protect, ctrl.markRead);
router.post('/read-all', protect, ctrl.markAllRead);

module.exports = router;
