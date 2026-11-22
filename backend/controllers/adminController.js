const Complaint = require('../models/Complaint');
const { transition, getAllowedTransitions, DFA_STATES } = require('../utils/dfa');

// Available campus IT technicians
const AVAILABLE_TECHNICIANS = [
  { id: 'TECH-01', name: 'R. Rajesh', phone: '+91 98401 23456', email: 'rajesh.net@college.edu', specialization: 'Campus Wi-Fi & APs' },
  { id: 'TECH-02', name: 'M. Suresh', phone: '+91 98402 34567', email: 'suresh.lan@college.edu', specialization: 'Structured Cabling & LAN' },
  { id: 'TECH-03', name: 'K. Anitha', phone: '+91 98403 45678', email: 'anitha.auth@college.edu', specialization: 'RADIUS & Firewall Auth' },
  { id: 'TECH-04', name: 'V. Prakash', phone: '+91 98404 56789', email: 'prakash.infra@college.edu', specialization: 'Core Switching & Routing' }
];

/**
 * @desc    Get Admin Dashboard Statistics & Analytics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const totalComplaints = await Complaint.countDocuments();

    // Counts by DFA state
    const [s0, s1, s2, s3, s4, s5, s6] = await Promise.all([
      Complaint.countDocuments({ currentState: 'S0' }),
      Complaint.countDocuments({ currentState: 'S1' }),
      Complaint.countDocuments({ currentState: 'S2' }),
      Complaint.countDocuments({ currentState: 'S3' }),
      Complaint.countDocuments({ currentState: 'S4' }),
      Complaint.countDocuments({ currentState: 'S5' }),
      Complaint.countDocuments({ currentState: 'S6' })
    ]);

    // Priority counts
    const [low, medium, high] = await Promise.all([
      Complaint.countDocuments({ priority: 'Low' }),
      Complaint.countDocuments({ priority: 'Medium' }),
      Complaint.countDocuments({ priority: 'High' })
    ]);

    // Category aggregation
    const categoryAgg = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Department aggregation
    const deptAgg = await Complaint.aggregate([
      { $group: { _id: '$studentSnapshot.department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent 8 complaints
    const recentComplaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      stats: {
        total: totalComplaints,
        newComplaints: s0,
        underReview: s1,
        assigned: s2,
        inProgress: s3,
        resolved: s4,
        closed: s5,
        rejected: s6,
        active: s0 + s1 + s2 + s3
      },
      stateDistribution: [
        { state: 'S0', name: DFA_STATES.S0.name, count: s0, color: DFA_STATES.S0.badgeColor },
        { state: 'S1', name: DFA_STATES.S1.name, count: s1, color: DFA_STATES.S1.badgeColor },
        { state: 'S2', name: DFA_STATES.S2.name, count: s2, color: DFA_STATES.S2.badgeColor },
        { state: 'S3', name: DFA_STATES.S3.name, count: s3, color: DFA_STATES.S3.badgeColor },
        { state: 'S4', name: DFA_STATES.S4.name, count: s4, color: DFA_STATES.S4.badgeColor },
        { state: 'S5', name: DFA_STATES.S5.name, count: s5, color: DFA_STATES.S5.badgeColor },
        { state: 'S6', name: DFA_STATES.S6.name, count: s6, color: DFA_STATES.S6.badgeColor }
      ],
      priorityDistribution: [
        { priority: 'High', count: high, color: '#ef4444' },
        { priority: 'Medium', count: medium, color: '#f59e0b' },
        { priority: 'Low', count: low, color: '#10b981' }
      ],
      categoryDistribution: categoryAgg.map(c => ({ category: c._id, count: c.count })),
      departmentDistribution: deptAgg.map(d => ({ department: d._id, count: d.count })),
      recentComplaints: recentComplaints.map(c => ({
        ...c.toObject(),
        allowedTransitions: getAllowedTransitions(c.currentState)
      })),
      technicians: AVAILABLE_TECHNICIANS
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all complaints for admin with advanced filtering
 * @route   GET /api/admin/complaints
 * @access  Private (Admin)
 */
exports.getAdminComplaints = async (req, res, next) => {
  // Uses complaintController.getAllComplaints which handles admin filters
  const complaintController = require('./complaintController');
  return complaintController.getAllComplaints(req, res, next);
};

/**
 * @desc    Assign a technician to a complaint (with automatic DFA transition if in S1)
 * @route   PUT /api/admin/complaints/:id/assign
 * @access  Private (Admin)
 */
exports.assignTechnician = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { technicianName, technicianPhone, technicianEmail, remarks } = req.body;

    if (!technicianName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide technicianName for assignment.'
      });
    }

    let query = id.startsWith('NET-') ? { complaintId: id } : { _id: id };
    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    // Set technician data
    complaint.assignedTechnician = {
      name: technicianName,
      phone: technicianPhone || '+91 98400 00000',
      email: technicianEmail || 'support@college.edu',
      assignedAt: new Date()
    };

    // If complaint is in S1 (Under Review), automatically execute ASSIGN transition to S2
    if (complaint.currentState === 'S1') {
      const transitionResult = transition('S1', 'ASSIGN');
      complaint.currentState = transitionResult.toState; // S2
      complaint.status = transitionResult.toStatus; // Assigned to Technician

      complaint.transitionHistory.push({
        fromState: 'S1',
        inputSymbol: 'ASSIGN',
        toState: 'S2',
        performedBy: req.user._id,
        performedByName: req.user.name,
        performedByRole: req.user.role,
        remarks: remarks || `Assigned to technician: ${technicianName}`,
        timestamp: new Date()
      });
    } else {
      // Just record technician update in history
      complaint.transitionHistory.push({
        fromState: complaint.currentState,
        inputSymbol: 'ASSIGN',
        toState: complaint.currentState,
        performedBy: req.user._id,
        performedByName: req.user.name,
        performedByRole: req.user.role,
        remarks: `Updated technician assignment to ${technicianName}. State retained as ${complaint.currentState}.`,
        timestamp: new Date()
      });
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      message: `Technician ${technicianName} successfully assigned to complaint ${complaint.complaintId}.`,
      complaint: {
        ...complaint.toObject(),
        allowedTransitions: getAllowedTransitions(complaint.currentState)
      }
    });
  } catch (error) {
    next(error);
  }
};
