const Match = require('../models/Match');
const Item = require('../models/Item');
const { findPotentialMatches } = require('../services/imageMatchingService');

// @desc    Get potential matches for a specific item
// @route   GET /api/matches/item/:itemId
// @access  Private
const getItemMatches = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const matches = await Match.find({
      $or: [{ lostItem: item._id }, { foundItem: item._id }]
    })
      .populate({
        path: 'lostItem',
        populate: { path: 'reporter', select: 'name' }
      })
      .populate({
        path: 'foundItem',
        populate: { path: 'reporter', select: 'name' }
      })
      .sort({ overallScore: -1 });

    res.json({
      success: true,
      data: matches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all potential matches relevant to logged-in user's reports
// @route   GET /api/matches/my
// @access  Private
const getMyMatches = async (req, res) => {
  try {
    const myItems = await Item.find({ reporter: req.user._id }).select('_id');
    const myItemIds = myItems.map((i) => i._id);

    const matches = await Match.find({
      $or: [{ lostItem: { $in: myItemIds } }, { foundItem: { $in: myItemIds } }]
    })
      .populate('lostItem')
      .populate('foundItem')
      .sort({ overallScore: -1 });

    res.json({
      success: true,
      data: matches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Manually trigger matching service for an item
// @route   POST /api/matches/trigger/:itemId
// @access  Private
const triggerMatching = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const results = await findPotentialMatches(item);

    res.json({
      success: true,
      message: `Similarity scan complete. Found ${results.length} potential matches!`,
      matches: results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getItemMatches,
  getMyMatches,
  triggerMatching
};
