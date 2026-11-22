const mongoose = require('mongoose');

// Subdocument schema for DFA transition history records
const transitionRecordSchema = new mongoose.Schema(
  {
    fromState: {
      type: String,
      required: true,
      enum: ['START', 'S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6']
    },
    inputSymbol: {
      type: String,
      required: true,
      enum: [
        'SUBMIT',
        'REVIEW',
        'ASSIGN',
        'START_WORK',
        'RESOLVE',
        'CLOSE',
        'REJECT',
        'REOPEN'
      ]
    },
    toState: {
      type: String,
      required: true,
      enum: ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    performedByName: {
      type: String,
      required: true,
      default: 'System'
    },
    performedByRole: {
      type: String,
      enum: ['student', 'admin', 'system'],
      default: 'system'
    },
    remarks: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID reference is required'],
      index: true
    },
    // Student snapshot for convenience & auditing
    studentSnapshot: {
      name: { type: String, required: true },
      registerNumber: { type: String, required: true },
      email: { type: String, required: true },
      department: { type: String, required: true },
      year: { type: String, required: true }
    },
    category: {
      type: String,
      required: [true, 'Please select a complaint category'],
      enum: {
        values: [
          'Wi-Fi Not Connecting',
          'Slow Internet',
          'No Internet Access',
          'Frequent Disconnection',
          'LAN Connectivity Issue',
          'Network Authentication Failure',
          'Other'
        ],
        message: '{VALUE} is not a recognized complaint category'
      }
    },
    networkType: {
      type: String,
      required: [true, 'Please specify network type (Wi-Fi or LAN)'],
      enum: {
        values: ['Wi-Fi', 'LAN'],
        message: 'Network type must be either Wi-Fi or LAN'
      }
    },
    location: {
      type: String,
      required: [true, 'Please select a location'],
      enum: {
        values: [
          'Classroom',
          'Laboratory',
          'Library',
          'Hostel',
          'Seminar Hall',
          'Administrative Block',
          'Campus Grounds',
          'Other'
        ],
        message: '{VALUE} is not a valid campus location'
      }
    },
    locationDetails: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description of the problem'],
      minlength: [10, 'Problem description must be at least 10 characters long'],
      maxlength: [1000, 'Problem description cannot exceed 1000 characters']
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
      index: true
    },
    currentState: {
      type: String,
      enum: ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
      default: 'S0',
      index: true
    },
    status: {
      type: String,
      enum: [
        'Complaint Registered',
        'Under Review',
        'Assigned to Technician',
        'Work In Progress',
        'Resolved',
        'Closed',
        'Rejected'
      ],
      default: 'Complaint Registered',
      index: true
    },
    assignedTechnician: {
      name: { type: String, default: 'Unassigned' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      assignedAt: { type: Date }
    },
    resolutionRemarks: {
      type: String,
      default: ''
    },
    transitionHistory: [transitionRecordSchema]
  },
  {
    timestamps: true
  }
);

// Map DFA states to human-readable complaint status strings
complaintSchema.statics.STATE_TO_STATUS = {
  S0: 'Complaint Registered',
  S1: 'Under Review',
  S2: 'Assigned to Technician',
  S3: 'Work In Progress',
  S4: 'Resolved',
  S5: 'Closed',
  S6: 'Rejected'
};

// Auto-generate unique sequential or random ID: NET-2026-XXXX
complaintSchema.pre('validate', async function (next) {
  if (!this.complaintId) {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const count = await this.constructor.countDocuments();
    const sequentialNum = String(count + 1).padStart(4, '0');
    this.complaintId = `NET-${year}-${sequentialNum}-${randomSuffix}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
