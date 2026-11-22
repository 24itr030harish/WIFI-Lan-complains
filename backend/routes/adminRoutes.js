const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getAdminComplaints,
  assignTechnician
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/complaints', getAdminComplaints);
router.put('/complaints/:id/assign', assignTechnician);

module.exports = router;
