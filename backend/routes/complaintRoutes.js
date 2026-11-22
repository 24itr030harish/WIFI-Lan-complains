const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  executeTransition,
  getComplaintHistory,
  cancelComplaint
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

// All complaint routes require authentication
router.use(protect);

router.post('/', createComplaint);
router.get('/my', getMyComplaints);
router.get('/', getAllComplaints);
router.get('/:id', getComplaintById);
router.post('/:id/transition', executeTransition);
router.get('/:id/history', getComplaintHistory);
router.post('/:id/cancel', cancelComplaint);

module.exports = router;
