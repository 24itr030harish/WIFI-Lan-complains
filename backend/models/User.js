const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    registerNumber: {
      type: String,
      required: function () {
        return this.role === 'student';
      },
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true
    },
    email: {
      type: String,
      required: [true, 'Please enter your college email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address'
      ]
    },
    department: {
      type: String,
      required: [true, 'Please select your department'],
      enum: {
        values: [
          'Computer Science and Engineering',
          'Information Technology',
          'Electronics and Communication Engineering',
          'Electrical and Electronics Engineering',
          'Mechanical Engineering',
          'Civil Engineering',
          'Artificial Intelligence & Data Science',
          'Cyber Security',
          'Network Administration / IT Support',
          'General Administration'
        ],
        message: '{VALUE} is not a supported department'
      }
    },
    year: {
      type: String,
      required: function () {
        return this.role === 'student';
      },
      enum: {
        values: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Faculty / Staff', 'N/A'],
        default: '1st Year'
      }
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT authentication token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
      registerNumber: this.registerNumber,
      department: this.department
    },
    process.env.JWT_SECRET || 'netcare_super_secret_jwt_key_2026_secure',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

module.exports = mongoose.model('User', userSchema);
