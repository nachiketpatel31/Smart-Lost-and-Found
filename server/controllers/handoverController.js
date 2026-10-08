const Handover = require('../models/Handover');
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const StatusHistory = require('../models/StatusHistory');
const AuditLog = require('../models/AuditLog');

// @desc    Complete physical handover of verified item (Admin)
// @route   POST /api/handovers
// @access  Private/Admin
const completeHandover = async (req, res) => {
  try {
    const { claimId, handoverNote } = req.body;

    if (!claimId) {
      return res.status(400).json({ success: false, message: 'Please provide valid claim ID.' });
    }

    const claim = await Claim.findById(claimId).populate('item').populate('claimant');
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim record not found.' });
    }

    if (claim.status !== 'Approved') {
      return res.status(400).json({ success: false, message: 'Only approved claims can proceed to physical handover.' });
    }

    const item = claim.item;

    // Create Handover record
    const handover = await Handover.create({
      item: item._id,
      claim: claim._id,
      claimant: claim.claimant._id,
      handedOverBy: req.user._id,
      handoverDate: new Date(),
      handoverNote: handoverNote || 'Physical handover verified by security admin.',
      status: 'Completed'
    });

    // Update Item status to Returned
    item.status = 'Returned';
    await item.save();

    // Update Claim status to Completed
    claim.status = 'Completed';
    claim.completedAt = new Date();
    await claim.save();

    // Log status history
    await StatusHistory.create({
      item: item._id,
      oldStatus: 'Verified',
      newStatus: 'Returned',
      changedBy: req.user._id,
      note: 'Item physically handed over to claimant.'
    });

    // Create Audit Log
    await AuditLog.create({
      action: 'HANDOVER_COMPLETED',
      performedBy: req.user._id,
      targetModel: 'Handover',
      targetId: handover._id,
      details: `Completed physical return handover of "${item.itemName}" to claimant ${claim.claimant.name}.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    // Send notification to claimant
    await Notification.create({
      user: claim.claimant._id,
      title: 'Item Handover Completed',
      message: `Your item "${item.itemName}" has been marked as returned! Thank you for using Smart Lost & Found. Please leave your feedback.`,
      type: 'HANDOVER_COMPLETED',
      link: `/feedback/${item._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Item physical handover marked as COMPLETED!',
      handover
    });
  } catch (error) {
    console.error('Handover completion error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get list of all completed handovers (Admin)
// @route   GET /api/handovers
// @access  Private/Admin
const getHandovers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Handover.countDocuments();
    const handovers = await Handover.find()
      .populate('item')
      .populate('claim')
      .populate('claimant', 'name email phone collegeId')
      .populate('handedOverBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: handovers,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  completeHandover,
  getHandovers
};
