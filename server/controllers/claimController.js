const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const StatusHistory = require('../models/StatusHistory');
const { generateClaimId } = require('../utils/generateReportId');
const { handleFileUpload } = require('../config/storage');

// @desc    Submit ownership claim for a found item
// @route   POST /api/claims
// @access  Private
const submitClaim = async (req, res) => {
  try {
    const { itemId, ownershipDescription, evidenceDetails } = req.body;

    if (!itemId || !ownershipDescription) {
      return res.status(400).json({ success: false, message: 'Please provide item ID and ownership description.' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Target found item not found.' });
    }

    if (String(item.reporter) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot claim an item reported by yourself.' });
    }

    // Check if user already submitted pending/approved claim for this item
    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user._id,
      status: { $in: ['Pending Verification', 'Approved'] }
    });

    if (existingClaim) {
      return res.status(400).json({ success: false, message: 'You have already submitted an active claim for this item.' });
    }

    let evidenceImageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await handleFileUpload(file);
        if (url) evidenceImageUrls.push(url);
      }
    }

    const claimId = await generateClaimId();

    const claim = await Claim.create({
      claimId,
      item: itemId,
      claimant: req.user._id,
      ownershipDescription,
      evidenceDetails: evidenceDetails || '',
      evidenceImages: evidenceImageUrls,
      status: 'Pending Verification',
      submittedAt: new Date()
    });

    // Update Item status to Claim Requested
    item.status = 'Claim Requested';
    await item.save();

    await StatusHistory.create({
      item: item._id,
      oldStatus: item.status,
      newStatus: 'Claim Requested',
      changedBy: req.user._id,
      note: `Claim ${claimId} submitted by user.`
    });

    // Notify found item reporter that a claim was filed
    await Notification.create({
      user: item.reporter,
      title: 'Ownership Claim Received',
      message: `A claim (${claimId}) has been submitted for your found item "${item.itemName}". Admin verification is underway.`,
      type: 'CLAIM_SUBMITTED',
      link: `/item/${item._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully! Campus security/admin will review your evidence.',
      claim
    });
  } catch (error) {
    console.error('Error submitting claim:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's personal claims
// @route   GET /api/claims/my
// @access  Private
const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('item')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: claims
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get claim details by ID (Privacy protected)
// @route   GET /api/claims/:id
// @access  Private
const getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('item')
      .populate('claimant', 'name email phone collegeId')
      .populate('verifiedBy', 'name');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    const isClaimant = String(claim.claimant._id) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isClaimant && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view your own submitted claims.' });
    }

    res.json({
      success: true,
      claim
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitClaim,
  getMyClaims,
  getClaimById
};
