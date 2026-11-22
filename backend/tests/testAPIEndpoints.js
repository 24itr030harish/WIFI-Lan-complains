const mongoose = require('mongoose');
const { app, server } = require('../server');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

async function testAllAPIEndpoints() {
  console.log('\n=============================================');
  console.log('   PHASE 6: FULL REST API ENDPOINTS TEST     ');
  console.log('=============================================\n');

  try {
    if (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => mongoose.connection.once('open', resolve));
    }

    // 1. Clean test accounts
    await User.deleteMany({ email: { $in: ['api_student@college.edu', 'api_admin@college.edu'] } });
    await Complaint.deleteMany({ 'studentSnapshot.email': 'api_student@college.edu' });

    // 2. Create Student & Admin accounts
    const student = await User.create({
      name: 'Sneha Reddy',
      registerNumber: '710021104050',
      email: 'api_student@college.edu',
      department: 'Computer Science and Engineering',
      year: '3rd Year',
      password: 'Password@123',
      role: 'student'
    });
    const studentToken = student.generateAuthToken();

    const admin = await User.create({
      name: 'Dr. K. Ramanathan',
      registerNumber: 'ADMIN-001',
      email: 'api_admin@college.edu',
      department: 'Network Administration / IT Support',
      year: 'Faculty / Staff',
      password: 'AdminPassword@123',
      role: 'admin'
    });
    const adminToken = admin.generateAuthToken();

    console.log(' [Setup] Created test student and admin accounts.');

    // 3. Test DFA Endpoints (Public)
    console.log('\n [Test 1] Testing GET /api/dfa/states...');
    const statesRes = await fetch('http://localhost:5000/api/dfa/states');
    const statesData = await statesRes.json();
    console.log(`  -> Status: ${statesRes.status} | Total States in Q: ${statesData.count}`);
    if (statesRes.status !== 200 || statesData.count !== 7) throw new Error('DFA states API failed');

    console.log('\n [Test 2] Testing GET /api/dfa/transitions...');
    const transRes = await fetch('http://localhost:5000/api/dfa/transitions');
    const transData = await transRes.json();
    console.log(`  -> Status: ${transRes.status} | Notation: ${transData.specification.formalDefinition.notation}`);
    if (transRes.status !== 200) throw new Error('DFA transitions API failed');

    // 4. Test Student Complaint Submission (POST /api/complaints)
    console.log('\n [Test 3] Testing POST /api/complaints (Student Submits Complaint)...');
    const submitRes = await fetch('http://localhost:5000/api/complaints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        category: 'Wi-Fi Not Connecting',
        networkType: 'Wi-Fi',
        location: 'Library',
        locationDetails: '2nd Floor Reading Hall',
        description: 'Unable to obtain IP address via DHCP when connecting to Campus-Library-5G.',
        priority: 'High'
      })
    });
    const submitData = await submitRes.json();
    console.log(`  -> Status: ${submitRes.status} | Complaint ID: ${submitData.complaint?.complaintId} | State: ${submitData.complaint?.currentState}`);
    if (submitRes.status !== 201 || submitData.complaint?.currentState !== 'S0') throw new Error('Complaint submission failed');
    const complaintId = submitData.complaint.complaintId;

    // 5. Test Student My Complaints (GET /api/complaints/my)
    console.log('\n [Test 4] Testing GET /api/complaints/my...');
    const myRes = await fetch('http://localhost:5000/api/complaints/my', {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const myData = await myRes.json();
    console.log(`  -> Status: ${myRes.status} | Retrieved Complaints: ${myData.count}`);
    if (myRes.status !== 200 || myData.count < 1) throw new Error('Get my complaints failed');

    // 6. Test Admin Dashboard (GET /api/admin/dashboard)
    console.log('\n [Test 5] Testing GET /api/admin/dashboard...');
    const dashRes = await fetch('http://localhost:5000/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const dashData = await dashRes.json();
    console.log(`  -> Status: ${dashRes.status} | Total: ${dashData.stats?.total} | S0 (New): ${dashData.stats?.newComplaints}`);
    if (dashRes.status !== 200 || dashData.stats?.newComplaints < 1) throw new Error('Admin dashboard failed');

    // 7. Student unauthorized access to Admin Dashboard (should be 403 Forbidden)
    console.log('\n [Test 6] Testing Student access to Admin Dashboard (Expected 403 Forbidden)...');
    const forbiddenRes = await fetch('http://localhost:5000/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    console.log(`  -> Status: ${forbiddenRes.status} (Expected 403)`);
    if (forbiddenRes.status !== 403) throw new Error('Role authorization failed: Student was not blocked from admin route');

    // 8. Admin DFA Transition: S0 -> S1 (REVIEW)
    console.log(`\n [Test 7] Testing Admin DFA Transition: S0 + REVIEW -> S1...`);
    const t1Res = await fetch(`http://localhost:5000/api/complaints/${complaintId}/transition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        inputSymbol: 'REVIEW',
        remarks: 'Admin verified complaint details with library staff.'
      })
    });
    const t1Data = await t1Res.json();
    console.log(`  -> Status: ${t1Res.status} | State: ${t1Data.complaint?.currentState} (${t1Data.complaint?.status})`);
    if (t1Data.complaint?.currentState !== 'S1') throw new Error('Transition S0 -> S1 failed');

    // 9. Student attempts admin transition ASSIGN on S1 (Expected 403)
    console.log(`\n [Test 8] Testing Student Unauthorized Transition ASSIGN on S1 (Expected 403)...`);
    const studentAssignRes = await fetch(`http://localhost:5000/api/complaints/${complaintId}/transition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ inputSymbol: 'ASSIGN' })
    });
    console.log(`  -> Status: ${studentAssignRes.status} (Expected 403)`);
    if (studentAssignRes.status !== 403) throw new Error('Student unauthorized transition should be 403');

    // 10. Admin assigns technician (PUT /api/admin/complaints/:id/assign) -> moves S1 + ASSIGN -> S2
    console.log(`\n [Test 9] Testing PUT /api/admin/complaints/:id/assign (S1 -> S2)...`);
    const assignRes = await fetch(`http://localhost:5000/api/admin/complaints/${complaintId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        technicianName: 'R. Rajesh',
        technicianPhone: '+91 98401 23456',
        technicianEmail: 'rajesh.net@college.edu',
        remarks: 'Assigned to senior Wi-Fi technician'
      })
    });
    const assignData = await assignRes.json();
    console.log(`  -> Status: ${assignRes.status} | State: ${assignData.complaint?.currentState} | Tech: ${assignData.complaint?.assignedTechnician?.name}`);
    if (assignData.complaint?.currentState !== 'S2') throw new Error('Technician assignment transition failed');

    // 11. Admin starts work: S2 + START_WORK -> S3
    console.log(`\n [Test 10] Testing Admin DFA Transition: S2 + START_WORK -> S3...`);
    const t2Res = await fetch(`http://localhost:5000/api/complaints/${complaintId}/transition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        inputSymbol: 'START_WORK',
        remarks: 'Technician inspected the library AP controller logs.'
      })
    });
    const t2Data = await t2Res.json();
    console.log(`  -> Status: ${t2Res.status} | State: ${t2Data.complaint?.currentState} (${t2Data.complaint?.status})`);
    if (t2Data.complaint?.currentState !== 'S3') throw new Error('Transition S2 -> S3 failed');

    // 12. Admin resolves issue: S3 + RESOLVE -> S4
    console.log(`\n [Test 11] Testing Admin DFA Transition: S3 + RESOLVE -> S4...`);
    const t3Res = await fetch(`http://localhost:5000/api/complaints/${complaintId}/transition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        inputSymbol: 'RESOLVE',
        remarks: 'Rebooted DHCP relay agent and updated access point firmware. DHCP lease working normally.'
      })
    });
    const t3Data = await t3Res.json();
    console.log(`  -> Status: ${t3Res.status} | State: ${t3Data.complaint?.currentState} (${t3Data.complaint?.status})`);
    if (t3Data.complaint?.currentState !== 'S4') throw new Error('Transition S3 -> S4 failed');

    // 13. Student reopens issue: S4 + REOPEN -> S2
    console.log(`\n [Test 12] Testing Student DFA Transition: S4 + REOPEN -> S2...`);
    const reopenRes = await fetch(`http://localhost:5000/api/complaints/${complaintId}/transition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        inputSymbol: 'REOPEN',
        remarks: 'Still disconnecting when moving between library tables.'
      })
    });
    const reopenData = await reopenRes.json();
    console.log(`  -> Status: ${reopenRes.status} | State: ${reopenData.complaint?.currentState} (${reopenData.complaint?.status})`);
    if (reopenData.complaint?.currentState !== 'S2') throw new Error('Transition S4 -> S2 (REOPEN) failed');

    // 14. Complete cycle to accepting state S5: S2 -> S3 -> S4 -> S5
    console.log(`\n [Test 13] Completing cycle to Accepting State S5 (START_WORK -> RESOLVE -> CLOSE)...`);
    // S2 -> S3
    await fetch(`http://localhost:5000/api/complaints/${complaintId}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ inputSymbol: 'START_WORK', remarks: 'Re-adjusting AP transmit power' })
    });
    // S3 -> S4
    await fetch(`http://localhost:5000/api/complaints/${complaintId}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ inputSymbol: 'RESOLVE', remarks: 'Adjusted roaming thresholds. Verified with user.' })
    });
    // S4 -> S5 (CLOSE by student)
    const closeRes = await fetch(`http://localhost:5000/api/complaints/${complaintId}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` },
      body: JSON.stringify({ inputSymbol: 'CLOSE', remarks: 'Confirmed Wi-Fi is working perfectly now. Thank you!' })
    });
    const closeData = await closeRes.json();
    console.log(`  -> Status: ${closeRes.status} | Final State: ${closeData.complaint?.currentState} (${closeData.complaint?.status})`);
    if (closeData.complaint?.currentState !== 'S5') throw new Error('Transition to accepting state S5 failed');

    // 15. Verify Transition History (GET /api/complaints/:id/history)
    console.log(`\n [Test 14] Testing GET /api/complaints/:id/history...`);
    const histRes = await fetch(`http://localhost:5000/api/complaints/${complaintId}/history`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const histData = await histRes.json();
    console.log(`  -> Status: ${histRes.status} | Total Transition Records: ${histData.historyCount}`);
    histData.history.forEach((h, idx) => {
      console.log(`     [Step ${idx + 1}] ${h.fromState} + ${h.inputSymbol} -> ${h.toState} | By: ${h.performedByName} (${h.performedByRole})`);
    });
    if (histData.historyCount < 6) throw new Error('Transition history count is insufficient');

    // Cleanup test data
    await User.deleteMany({ email: { $in: ['api_student@college.edu', 'api_admin@college.edu'] } });
    await Complaint.deleteMany({ 'studentSnapshot.email': 'api_student@college.edu' });

    console.log('\n✅ ALL BACKEND API ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY!\n');

    server.close(async () => {
      await mongoose.connection.close(false);
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Phase 6 API test failed:', error.message);
    server.close(async () => {
      await mongoose.connection.close(false);
      process.exit(1);
    });
  }
}

setTimeout(testAllAPIEndpoints, 1500);
