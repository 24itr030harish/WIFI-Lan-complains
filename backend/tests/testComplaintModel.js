const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
require('dotenv').config();

async function testComplaintModel() {
  console.log('\n========================================');
  console.log('   PHASE 4: COMPLAINT MODEL VERIFICATION');
  console.log('========================================\n');

  try {
    await connectDB();

    // 1. Setup a test student
    await User.deleteMany({ email: 'complaint_tester@college.edu' });
    const student = await User.create({
      name: 'Priya Sharma',
      registerNumber: '710021104088',
      email: 'complaint_tester@college.edu',
      department: 'Information Technology',
      year: '2nd Year',
      password: 'Password@123',
      role: 'student'
    });
    console.log('[Setup] Test student created:', student.name, `(${student._id})`);

    // 2. Test successful complaint creation
    console.log('\n[Test 1] Testing successful Complaint creation...');
    const complaint = await Complaint.create({
      studentId: student._id,
      studentSnapshot: {
        name: student.name,
        registerNumber: student.registerNumber,
        email: student.email,
        department: student.department,
        year: student.year
      },
      category: 'Wi-Fi Not Connecting',
      networkType: 'Wi-Fi',
      location: 'Laboratory',
      locationDetails: 'CS Lab 2, 1st Floor',
      description: 'Cannot connect to Campus-WiFi SSID from Dell laptops in CS Lab 2.',
      priority: 'High',
      transitionHistory: [
        {
          fromState: 'START',
          inputSymbol: 'SUBMIT',
          toState: 'S0',
          performedBy: student._id,
          performedByName: student.name,
          performedByRole: 'student',
          remarks: 'Complaint registered by student'
        }
      ]
    });

    console.log(` -> Created Complaint ID: ${complaint.complaintId}`);
    console.log(` -> Initial State: ${complaint.currentState}`);
    console.log(` -> Status: ${complaint.status}`);
    console.log(` -> History records count: ${complaint.transitionHistory.length}`);

    if (!complaint.complaintId.startsWith('NET-') || complaint.currentState !== 'S0') {
      throw new Error('Default complaint values are incorrect');
    }

    // 3. Test short description validation
    console.log('\n[Test 2] Testing validation failure for short description (< 10 chars)...');
    try {
      await Complaint.create({
        studentId: student._id,
        studentSnapshot: {
          name: student.name,
          registerNumber: student.registerNumber,
          email: student.email,
          department: student.department,
          year: student.year
        },
        category: 'Slow Internet',
        networkType: 'Wi-Fi',
        location: 'Hostel',
        description: 'Too slow', // only 8 chars
        priority: 'Low'
      });
      throw new Error('Validation should have thrown an error but succeeded!');
    } catch (err) {
      console.log(' -> Validation correctly rejected short description:', err.message);
    }

    // 4. Test invalid category validation
    console.log('\n[Test 3] Testing validation failure for invalid category...');
    try {
      await Complaint.create({
        studentId: student._id,
        studentSnapshot: {
          name: student.name,
          registerNumber: student.registerNumber,
          email: student.email,
          department: student.department,
          year: student.year
        },
        category: 'InvalidNonExistentCategory',
        networkType: 'Wi-Fi',
        location: 'Hostel',
        description: 'Testing invalid category enum check in complaint model.',
        priority: 'Low'
      });
      throw new Error('Validation should have thrown an error but succeeded!');
    } catch (err) {
      console.log(' -> Validation correctly rejected invalid category:', err.message);
    }

    // Clean up
    await Complaint.deleteMany({ studentId: student._id });
    await User.deleteMany({ email: 'complaint_tester@college.edu' });

    console.log('\n✅ ALL COMPLAINT MODEL TESTS PASSED SUCCESSFULLY!\n');
    await mongoose.connection.close(false);
    process.exit(0);
  } catch (err) {
    console.error('❌ Phase 4 Test failed:', err);
    await mongoose.connection.close(false);
    process.exit(1);
  }
}

testComplaintModel();
