const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  toggleUserStatus,
  getAllClaims,
  approveClaim,
  rejectClaim,
  getAuditLogs
} = require('../controllers/adminController');

const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/claims', getAllClaims);
router.put('/claims/:id/approve', approveClaim);
router.put('/claims/:id/reject', rejectClaim);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
