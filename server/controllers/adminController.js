const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Match = require('../models/Match');
const Handover = require('../models/Handover');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const StatusHistory = require('../models/StatusHistory');

// @desc    Get Admin Dashboard Stats & Visualization Chart Data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalLost = await Item.countDocuments({ type: 'lost' });
    const totalFound = await Item.countDocuments({ type: 'found' });
    const pendingClaims = await Claim.countDocuments({ status: 'Pending Verification' });
    const verifiedClaims = await Claim.countDocuments({ status: 'Approved' });
    const returnedItems = await Item.countDocuments({ status: 'Returned' });
    const potentialMatches = await Match.countDocuments({ status: 'Suggested' });
    const unclaimedItems = await Item.countDocuments({ status: 'Unclaimed' });
    const rejectedClaims = await Claim.countDocuments({ status: 'Rejected' });

    // Aggregations for Chart Analytics
    const categoryStats = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const locationStats = await Item.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const statusStats = await Item.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalLost,
        totalFound,
        pendingClaims,
        verifiedClaims,
        returnedItems,
        potentialMatches,
        unclaimedItems,
        rejectedClaims
      },
      charts: {
        categoryStats,
        locationStats,
        statusStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered users (Admin User Management)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (query) {
      const regex = new RegExp(query, 'i');
      filter.$or = [{ name: regex }, { email: regex }, { collegeId: regex }, { phone: regex }];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum);

    res.json({
      success: true,
      data: users,
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

// @desc    Toggle user active/deactivated status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate administrator account.' });
    }

    const newStatus = user.accountStatus === 'active' ? 'deactivated' : 'active';
    user.accountStatus = newStatus;
    await user.save();

    await AuditLog.create({
      action: newStatus === 'deactivated' ? 'USER_DEACTIVATED' : 'USER_ACTIVATED',
      performedBy: req.user._id,
      targetModel: 'User',
      targetId: user._id,
      details: `Account status of ${user.name} (${user.email}) changed to ${newStatus}.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({
      success: true,
      message: `User ${user.name} has been ${newStatus}.`,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all claims with filtering & pagination
// @route   GET /api/admin/claims
// @access  Private/Admin
const getAllClaims = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let filter = {};
    if (status) filter.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Claim.countDocuments(filter);
    const claims = await Claim.find(filter)
      .populate('item')
      .populate('claimant', 'name email phone collegeId')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: claims,
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

// @desc    Approve ownership claim (Admin)
// @route   PUT /api/admin/claims/:id/approve
// @access  Private/Admin
const approveClaim = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const claim = await Claim.findById(req.params.id).populate('item').populate('claimant');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    claim.status = 'Approved';
    claim.adminNote = adminNote || 'Ownership verified through submitted evidence.';
    claim.verifiedBy = req.user._id;
    claim.verifiedAt = new Date();
    await claim.save();

    // Update item status to Verified
    const item = claim.item;
    item.status = 'Verified';
    await item.save();

    await StatusHistory.create({
      item: item._id,
      oldStatus: 'Claim Requested',
      newStatus: 'Verified',
      changedBy: req.user._id,
      note: `Claim approved by admin ${req.user.name}.`
    });

    await AuditLog.create({
      action: 'CLAIM_APPROVED',
      performedBy: req.user._id,
      targetModel: 'Claim',
      targetId: claim._id,
      details: `Approved claim ${claim.claimId} for item "${item.itemName}" by claimant ${claim.claimant.name}.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    await Notification.create({
      user: claim.claimant._id,
      title: 'Claim Approved!',
      message: `Great news! Your claim for "${item.itemName}" has been APPROVED. Please visit campus security for physical handover.`,
      type: 'CLAIM_APPROVED',
      link: `/claims/my`
    });

    res.json({
      success: true,
      message: 'Claim APPROVED successfully! Item status updated to Verified.',
      claim
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject ownership claim (Admin)
// @route   PUT /api/admin/claims/:id/reject
// @access  Private/Admin
const rejectClaim = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const claim = await Claim.findById(req.params.id).populate('item').populate('claimant');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    claim.status = 'Rejected';
    claim.adminNote = adminNote || 'Insufficient or unmatched ownership evidence provided.';
    claim.verifiedBy = req.user._id;
    claim.verifiedAt = new Date();
    await claim.save();

    // Reset item status to Reported / Under Review if no active approved claims
    const item = claim.item;
    item.status = 'Reported';
    await item.save();

    await StatusHistory.create({
      item: item._id,
      oldStatus: 'Claim Requested',
      newStatus: 'Reported',
      changedBy: req.user._id,
      note: `Claim ${claim.claimId} rejected by admin. Reason: ${claim.adminNote}`
    });

    await AuditLog.create({
      action: 'CLAIM_REJECTED',
      performedBy: req.user._id,
      targetModel: 'Claim',
      targetId: claim._id,
      details: `Rejected claim ${claim.claimId} for item "${item.itemName}". Reason: ${claim.adminNote}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    await Notification.create({
      user: claim.claimant._id,
      title: 'Claim Update',
      message: `Your claim for "${item.itemName}" was rejected. Reason: ${claim.adminNote}`,
      type: 'CLAIM_REJECTED',
      link: `/claims/my`
    });

    res.json({
      success: true,
      message: 'Claim rejected.',
      claim
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get audit log trail (Admin)
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .populate('performedBy', 'name role email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: logs,
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
  getDashboardStats,
  getUsers,
  toggleUserStatus,
  getAllClaims,
  approveClaim,
  rejectClaim,
  getAuditLogs
};
