const express = require('express');
const router = express.Router();
const { completeHandover, getHandovers } = require('../controllers/handoverController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.post('/', protect, admin, completeHandover);
router.get('/', protect, admin, getHandovers);

module.exports = router;
