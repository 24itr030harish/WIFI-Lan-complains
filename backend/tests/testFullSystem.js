const mongoose = require('mongoose');
const { app, server } = require('../server');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { transition } = require('../utils/dfa');

async function testFullSystem() {
  console.log('\n============================================================');
  console.log('   PHASE 12: COMPREHENSIVE END-TO-END SYSTEM TEST SUITE     ');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => mongoose.connection.once('open', resolve));
    }

    // 1. Test Student Registration
    console.log('\n[Requirement 1 & 14] Testing Student Registration & Form Validation...');
    const uniqueEmail = `test_${Date.now()}@college.edu`;
    const uniqueReg = `REG${Math.floor(100000 + Math.random() * 900000)}`;

    // 1a: Validation failure on missing fields
    const invalidRegRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Incomplete User' })
    });
    assert(invalidRegRes.status === 400, 'Registration rejects missing fields with HTTP 400');

    // 1b: Successful registration
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automation Tester',
        registerNumber: uniqueReg,
        department: 'Computer Science and Engineering',
        year: '3rd Year',
        email: uniqueEmail,
        password: 'Password@123'
      })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && !!regData.token, 'Student successfully registered with token returned');

    // 2. Test Student Login
    console.log('\n[Requirement 2] Testing Student Login...');
    const studentLoginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password: 'Password@123' })
    });
    const studentLoginData = await studentLoginRes.json();
    const studentToken = studentLoginData.token;
    assert(studentLoginRes.status === 200 && studentLoginData.user?.role === 'student', 'Student login succeeded with role student');

    // 3. Test Admin Login
    console.log('\n[Requirement 3] Testing Admin Login...');
    const adminLoginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@college.edu', password: 'Admin@123' })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    assert(adminLoginRes.status === 200 && adminLoginData.user?.role === 'admin', 'Admin login succeeded with role admin');

    // 4. Test Complaint Submission
    console.log('\n[Requirement 4 & 15] Testing Complaint Submission & MongoDB Persistence...');
    const submitRes = await fetch('http://localhost:5000/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` },
      body: JSON.stringify({
        category: 'Frequent Disconnection',
        networkType: 'Wi-Fi',
        location: 'Laboratory',
        locationDetails: 'DSP Lab Bench 4',
        description: 'Wi-Fi disconnects every time ping packet size exceeds 1000 bytes.',
        priority: 'High'
      })
    });
    const submitData = await submitRes.json();
    const testComplaintId = submitData.complaint?.complaintId;
    assert(submitRes.status === 201 && submitData.complaint?.currentState === 'S0', `Complaint created at initial state S0: ${testComplaintId}`);

    // Verify MongoDB persistence directly
    const persistedComplaint = await Complaint.findOne({ complaintId: testComplaintId });
    assert(persistedComplaint !== null && persistedComplaint.status === 'Complaint Registered', 'Verified complaint stored in MongoDB database');

    // 5. Test Complaint Listing (Student & Admin)
    console.log('\n[Requirement 5] Testing Complaint Listing...');
    const myListRes = await fetch('http://localhost:5000/api/complaints/my', {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const myListData = await myListRes.json();
    assert(myListRes.status === 200 && myListData.count >= 1, `Student retrieves personal complaints (found: ${myListData.count})`);

    const adminListRes = await fetch('http://localhost:5000/api/complaints', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminListData = await adminListRes.json();
    assert(adminListRes.status === 200 && adminListData.count >= 10, `Admin retrieves all complaints (found: ${adminListData.count})`);

    // 6. Test Complaint Tracking
    console.log('\n[Requirement 6] Testing Complaint Tracking & History...');
    const trackRes = await fetch(`http://localhost:5000/api/complaints/${testComplaintId}/history`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const trackData = await trackRes.json();
    assert(trackRes.status === 200 && trackData.historyCount >= 1, `Complaint history retrieved with ${trackData.historyCount} record(s)`);

    // 7. Test Valid DFA Transitions (S0 -> S1 -> S2 -> S3 -> S4 -> S5)
    console.log('\n[Requirement 7, 9, 10, 11] Testing Valid DFA State Transitions...');

    // S0 -> S1 (REVIEW)
    const tReview = await fetch(`http://localhost:5000/api/complaints/${testComplaintId}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ inputSymbol: 'REVIEW', remarks: 'Admin verified complaint' })
    });
    const dReview = await tReview.json();
    assert(dReview.complaint?.currentState === 'S1', 'Transition S0 + REVIEW → S1 (Under Review)');

    // 9. Complaint Assignment (S1 -> S2)
    const tAssign = await fetch(`http://localhost:5000/api/admin/complaints/${testComplaintId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ technicianName: 'R. Rajesh', remarks: 'Assigned to Rajesh' })
    });
    const dAssign = await tAssign.json();
    assert(dAssign.complaint?.currentState === 'S2' && dAssign.complaint?.assignedTechnician?.name === 'R. Rajesh', 'Technician assigned & transitioned S1 + ASSIGN → S2');

    // S2 -> S3 (START_WORK)
    const tWork = await fetch(`http://localhost:5000/api/complaints/${testComplaintId}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ inputSymbol: 'START_WORK', remarks: 'Started diagnosis' })
    });
    const dWork = await tWork.json();
    assert(dWork.complaint?.currentState === 'S3', 'Transition S2 + START_WORK → S3 (Work In Progress)');

    // 10. Complaint Resolution (S3 -> S4)
    const tResolve = await fetch(`http://localhost:5000/api/complaints/${testComplaintId}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ inputSymbol: 'RESOLVE', remarks: 'Replaced AP antenna and re-tested' })
    });
    const dResolve = await tResolve.json();
    assert(dResolve.complaint?.currentState === 'S4', 'Transition S3 + RESOLVE → S4 (Resolved)');

    // 12. Complaint Reopening (S4 -> S2)
    console.log('\n[Requirement 12] Testing Complaint Reopening Loop (S4 + REOPEN → S2)...');
    const tReopen = await fetch(`http://localhost:5000/api/complaints/${testComplaintId}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` },
      body: JSON.stringify({ inputSymbol: 'REOPEN', remarks: 'Packets still dropping near doorway' })
    });
    const dReopen = await tReopen.json();
    assert(dReopen.complaint?.currentState === 'S2', 'Reopening cycle verified: S4 + REOPEN → S2 (Assigned)');

    // Re-progress to S4
    await fetch(`http://localhost:5000/api/complaints/${testComplaintId}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ inputSymbol: 'START_WORK' })
    });
    await fetch(`http://localhost:5000/api/complaints/${testComplaintId}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ inputSymbol: 'RESOLVE', remarks: 'Permanently recalibrated channel' })
    });

    // 11. Complaint Closing into Accepting State S5
    console.log('\n[Requirement 11] Testing Complaint Closing into Accepting State S5 (S4 + CLOSE → S5)...');
    const tClose = await fetch(`http://localhost:5000/api/complaints/${testComplaintId}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` },
      body: JSON.stringify({ inputSymbol: 'CLOSE', remarks: 'Confirmed 100% stable connection' })
    });
    const dClose = await tClose.json();
    assert(dClose.complaint?.currentState === 'S5' && dClose.complaint?.status === 'Closed', 'Reached Accepting Final State S5 (Closed)');

    // 8. Test Invalid DFA Transitions (Must return HTTP 400)
    console.log('\n[Requirement 8] Testing Invalid DFA Transitions...');
    const tInvalid = await fetch(`http://localhost:5000/api/complaints/${testComplaintId}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ inputSymbol: 'REVIEW' }) // Cannot review an already closed (S5) complaint!
    });
    const dInvalid = await tInvalid.json();
    assert(tInvalid.status === 400, `Undefined transition correctly rejected with HTTP 400: ${dInvalid.message}`);

    // 13. Test Unauthorized Access Prevention
    console.log('\n[Requirement 13] Testing Unauthorized Access Security...');
    const studentAdminRes = await fetch('http://localhost:5000/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(studentAdminRes.status === 403, 'Student blocked from Admin Dashboard with HTTP 403 Forbidden');

    // Cleanup test user and test complaint
    await User.deleteOne({ email: uniqueEmail });
    await Complaint.deleteOne({ complaintId: testComplaintId });

    console.log('\n============================================================');
    console.log(`   FULL SYSTEM TEST SUMMARY: ${passed} PASSED, ${failed} FAILED `);
    console.log('============================================================\n');

    server.close(async () => {
      await mongoose.connection.close(false);
      process.exit(failed > 0 ? 1 : 0);
    });
  } catch (error) {
    console.error('❌ Full system test suite failed:', error);
    server.close(async () => {
      await mongoose.connection.close(false);
      process.exit(1);
    });
  }
}

setTimeout(testFullSystem, 1500);
