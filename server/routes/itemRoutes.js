const express = require('express');
const router = express.Router();
const {
  createItemReport,
  checkDuplicates,
  searchItems,
  getItemById,
  getMyReports,
  updateItemStatus
} = require('../controllers/itemController');

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/check-duplicates', protect, checkDuplicates);
router.post('/lost', protect, upload.array('images', 5), (req, res, next) => {
  req.body.type = 'lost';
  createItemReport(req, res, next);
});
router.post('/found', protect, upload.array('images', 5), (req, res, next) => {
  req.body.type = 'found';
  createItemReport(req, res, next);
});

router.get('/search', searchItems);
router.get('/my', protect, getMyReports);
router.get('/:id', getItemById);
router.put('/:id/status', protect, updateItemStatus);

module.exports = router;
