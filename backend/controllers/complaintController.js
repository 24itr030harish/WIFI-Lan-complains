const Complaint = require('../models/Complaint');
const { transition, getAllowedTransitions, DFA_STATES } = require('../utils/dfa');

/**
 * @desc    Submit a new complaint
 * @route   POST /api/complaints
 * @access  Private (Student & Admin)
 */
exports.createComplaint = async (req, res, next) => {
  try {
    const { category, networkType, location, locationDetails, description, priority } = req.body;

    // Validation
    if (!category || !networkType || !location || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: category, networkType, location, description.'
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Problem description must be at least 10 characters long.'
      });
    }

    // Capture student snapshot from logged-in user
    const studentSnapshot = {
      name: req.user.name,
      registerNumber: req.user.registerNumber || 'ADMIN-REF',
      email: req.user.email,
      department: req.user.department,
      year: req.user.year || 'N/A'
    };

    // Initial transition record: SUBMIT -> S0
    const initialTransition = {
      fromState: 'START',
      inputSymbol: 'SUBMIT',
      toState: 'S0',
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      remarks: 'Complaint submitted by student and registered into NetCare system.',
      timestamp: new Date()
    };

    const complaint = await Complaint.create({
      studentId: req.user._id,
      studentSnapshot,
      category,
      networkType,
      location,
      locationDetails: locationDetails || '',
      description: description.trim(),
      priority: priority || 'Medium',
      currentState: 'S0',
      status: 'Complaint Registered',
      transitionHistory: [initialTransition]
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      complaint: {
        ...complaint.toObject(),
        allowedTransitions: getAllowedTransitions(complaint.currentState)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get complaints submitted by the logged in student
 * @route   GET /api/complaints/my
 * @access  Private (Student)
 */
exports.getMyComplaints = async (req, res, next) => {
  try {
    const { status, priority, category } = req.query;
    const query = { studentId: req.user._id };

    if (status) query.currentState = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });

    const formattedComplaints = complaints.map((c) => ({
      ...c.toObject(),
      allowedTransitions: getAllowedTransitions(c.currentState)
    }));

    res.status(200).json({
      success: true,
      count: formattedComplaints.length,
      complaints: formattedComplaints
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all complaints with filters (Admin view)
 * @route   GET /api/complaints
 * @access  Private (Admin)
 */
exports.getAllComplaints = async (req, res, next) => {
  try {
    // If user is a student, restrict to their own complaints
    if (req.user.role === 'student') {
      return exports.getMyComplaints(req, res, next);
    }

    const { status, priority, department, category, search, networkType } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.currentState = status;
    }

    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (networkType && networkType !== 'ALL') {
      query.networkType = networkType;
    }

    if (department && department !== 'ALL') {
      query['studentSnapshot.department'] = department;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { complaintId: searchRegex },
        { 'studentSnapshot.name': searchRegex },
        { 'studentSnapshot.registerNumber': searchRegex },
        { description: searchRegex },
        { location: searchRegex }
      ];
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });

    const formattedComplaints = complaints.map((c) => ({
      ...c.toObject(),
      allowedTransitions: getAllowedTransitions(c.currentState)
    }));

    res.status(200).json({
      success: true,
      count: formattedComplaints.length,
      complaints: formattedComplaints
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single complaint details by ID or complaintId
 * @route   GET /api/complaints/:id
 * @access  Private
 */
exports.getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if ID is a MongoDB ObjectId or formatted complaintId
    let query = {};
    if (id.startsWith('NET-')) {
      query = { complaintId: id };
    } else {
      query = { _id: id };
    }

    const complaint = await Complaint.findOne(query).populate('studentId', 'name email registerNumber department year');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `Complaint not found with ID '${id}'.`
      });
    }

    // Role check: Students can only view their own complaints
    if (req.user.role === 'student' && complaint.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this complaint.'
      });
    }

    res.status(200).json({
      success: true,
      complaint: {
        ...complaint.toObject(),
        allowedTransitions: getAllowedTransitions(complaint.currentState)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Execute a verified DFA state transition on a complaint
 * @route   POST /api/complaints/:id/transition
 * @access  Private (Admin or Student for allowed transitions)
 */
exports.executeTransition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { inputSymbol, remarks, technician } = req.body;

    if (!inputSymbol) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the DFA inputSymbol for the state transition.'
      });
    }

    // Find complaint
    let query = id.startsWith('NET-') ? { complaintId: id } : { _id: id };
    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `Complaint not found with ID '${id}'.`
      });
    }

    // 1. Validate DFA Transition via Automaton Engine δ(currentState, inputSymbol)
    let transitionResult;
    try {
      transitionResult = transition(complaint.currentState, inputSymbol);
    } catch (dfaErr) {
      return res.status(dfaErr.statusCode || 400).json({
        success: false,
        message: dfaErr.message,
        type: dfaErr.type,
        currentState: complaint.currentState,
        attemptedSymbol: inputSymbol,
        allowedTransitions: getAllowedTransitions(complaint.currentState)
      });
    }

    // 2. Role Authorization Check for this specific transition
    // E.g., S0->S1 (REVIEW) is admin-only, S4->S5 (CLOSE) allowed for student or admin
    if (!transitionResult.allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Permission Denied: Your role '${req.user.role}' cannot execute the '${inputSymbol}' transition. Required role: [${transitionResult.allowedRoles.join(', ')}].`
      });
    }

    // Students can only execute transitions on their OWN complaints
    if (req.user.role === 'student' && complaint.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Permission Denied: You cannot modify another student\'s complaint.'
      });
    }

    // 3. Update technician information if ASSIGN symbol
    if (inputSymbol === 'ASSIGN' && technician) {
      complaint.assignedTechnician = {
        name: technician.name || 'Campus IT Support Team',
        phone: technician.phone || '+91 98765 43210',
        email: technician.email || 'support@college.edu',
        assignedAt: new Date()
      };
    }

    // 4. Update resolution remarks if RESOLVE symbol
    if (inputSymbol === 'RESOLVE' && remarks) {
      complaint.resolutionRemarks = remarks;
    }

    // 5. Append transition record to immutable transitionHistory
    const transitionRecord = {
      fromState: complaint.currentState,
      inputSymbol,
      toState: transitionResult.toState,
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      remarks: remarks || `Executed transition via input '${inputSymbol}'.`,
      timestamp: new Date()
    };

    complaint.transitionHistory.push(transitionRecord);

    // 6. Update current DFA state and status
    const previousState = complaint.currentState;
    complaint.currentState = transitionResult.toState;
    complaint.status = transitionResult.toStatus;

    await complaint.save();

    res.status(200).json({
      success: true,
      message: `State transitioned successfully: δ(${previousState}, ${inputSymbol}) → ${complaint.currentState} (${complaint.status}).`,
      transition: {
        fromState: previousState,
        inputSymbol,
        toState: complaint.currentState,
        toStatus: complaint.status,
        performedBy: req.user.name,
        role: req.user.role,
        timestamp: transitionRecord.timestamp
      },
      complaint: {
        ...complaint.toObject(),
        allowedTransitions: getAllowedTransitions(complaint.currentState)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get full DFA transition history for a complaint
 * @route   GET /api/complaints/:id/history
 * @access  Private
 */
exports.getComplaintHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = id.startsWith('NET-') ? { complaintId: id } : { _id: id };
    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `Complaint not found with ID '${id}'.`
      });
    }

    if (req.user.role === 'student' && complaint.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot view this complaint\'s history.'
      });
    }

    res.status(200).json({
      success: true,
      complaintId: complaint.complaintId,
      currentState: complaint.currentState,
      status: complaint.status,
      historyCount: complaint.transitionHistory.length,
      history: complaint.transitionHistory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Student cancels a complaint (only valid when in S0 via REJECT or direct cancel)
 * @route   POST /api/complaints/:id/cancel
 * @access  Private (Student)
 */
exports.cancelComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = id.startsWith('NET-') ? { complaintId: id } : { _id: id };
    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    if (complaint.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own complaints.'
      });
    }

    // Can only cancel if complaint is in S0
    if (complaint.currentState !== 'S0') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel complaint in state '${complaint.currentState}' (${complaint.status}). Cancellation is only permitted for newly registered complaints in S0.`
      });
    }

    // Execute transition S0 + REJECT -> S6
    const transitionResult = transition('S0', 'REJECT');

    complaint.transitionHistory.push({
      fromState: 'S0',
      inputSymbol: 'REJECT',
      toState: 'S6',
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: 'student',
      remarks: 'Cancelled by student before review.',
      timestamp: new Date()
    });

    complaint.currentState = 'S6';
    complaint.status = 'Rejected';
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint cancelled successfully and marked as Rejected (S6).',
      complaint
    });
  } catch (error) {
    next(error);
  }
};
