const Feedback = require('../models/Feedback');
const Item = require('../models/Item');

// @desc    Submit recovery feedback for a returned item
// @route   POST /api/feedback
// @access  Private
const submitFeedback = async (req, res) => {
  try {
    const { itemId, rating, comment } = req.body;

    if (!itemId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide item ID, rating (1-5 stars), and comment.' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item record not found.' });
    }

    if (item.status !== 'Returned') {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted for items with status "Returned".' });
    }

    const existingFeedback = await Feedback.findOne({ item: itemId, user: req.user._id });
    if (existingFeedback) {
      return res.status(400).json({ success: false, message: 'You have already submitted feedback for this item recovery.' });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      item: itemId,
      rating: parseInt(rating, 10),
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Glad we could reunite your lost item.',
      feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all user feedback (Admin / Public showcase)
// @route   GET /api/feedback
// @access  Public
const getAllFeedback = async (req, res) => {
  try {
    const feedbackList = await Feedback.find()
      .populate('user', 'name')
      .populate('item', 'itemName type category location')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: feedbackList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback
};
