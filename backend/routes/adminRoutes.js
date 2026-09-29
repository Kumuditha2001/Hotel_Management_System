const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getStaffList,
  createStaffMember,
  deleteStaffMember,
  updateStaffRole,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// GET /api/admin/dashboard - business overview & statistics
router.get('/dashboard', getDashboardStats);

// Staff management
router.get('/staff', getStaffList);
router.post('/staff', createStaffMember);
router.delete('/staff/:id', deleteStaffMember);
router.put('/staff/:id/role', updateStaffRole);

module.exports = router;
