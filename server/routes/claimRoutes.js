const express = require('express');
const router = express.Router();
const { submitClaim, getMyClaims, getClaimById } = require('../controllers/claimController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.array('evidenceImages', 3), submitClaim);
router.get('/my', protect, getMyClaims);
router.get('/:id', protect, getClaimById);

module.exports = router;
