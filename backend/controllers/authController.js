const User = require('../models/User');

/**
 * @desc    Register a new student
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, registerNumber, email, department, year, password } = req.body;

    // Field presence validation
    if (!name || !registerNumber || !email || !department || !year || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, registerNumber, email, department, year, password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if email already registered
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `An account with email '${email}' is already registered.`
      });
    }

    // Check if register number already registered
    const existingRegNo = await User.findOne({ registerNumber: registerNumber.toUpperCase() });
    if (existingRegNo) {
      return res.status(400).json({
        success: false,
        message: `An account with register number '${registerNumber.toUpperCase()}' is already registered.`
      });
    }

    // Create student user
    const user = await User.create({
      name,
      registerNumber: registerNumber.toUpperCase(),
      email: email.toLowerCase(),
      department,
      year,
      password,
      role: 'student'
    });

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        registerNumber: user.registerNumber,
        email: user.email,
        department: user.department,
        year: user.year,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user (Student or Admin)
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Check for user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User with this email does not exist.'
      });
    }

    // Match password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password is incorrect.'
      });
    }

    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}! Login successful.`,
      token,
      user: {
        id: user._id,
        name: user.name,
        registerNumber: user.registerNumber,
        email: user.email,
        department: user.department,
        year: user.year,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/profile
 * @access  Private (Protected by JWT)
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        registerNumber: user.registerNumber,
        email: user.email,
        department: user.department,
        year: user.year,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};
