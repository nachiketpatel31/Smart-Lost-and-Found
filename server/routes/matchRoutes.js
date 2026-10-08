const express = require('express');
const router = express.Router();
const { getItemMatches, getMyMatches, triggerMatching } = require('../controllers/matchController');
const { protect } = require('../middleware/auth');

router.get('/my', protect, getMyMatches);
router.get('/item/:itemId', protect, getItemMatches);
router.post('/trigger/:itemId', protect, triggerMatching);

module.exports = router;
