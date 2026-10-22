const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/leaderboardController');

router.get('/overall', ctrl.overall);
router.get('/monthly', ctrl.monthly);

module.exports = router;
