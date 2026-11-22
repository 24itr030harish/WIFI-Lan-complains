const mongoose = require('mongoose');
const { app, server } = require('../server');
const User = require('../models/User');

async function runAuthTests() {
  console.log('\n========================================');
  console.log('   PHASE 3: AUTH & ROLE VERIFICATION   ');
  console.log('========================================\n');

  try {
    // Wait for DB to be connected
    if (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => mongoose.connection.once('open', resolve));
    }

    // Clean previous test users
    await User.deleteMany({ email: { $in: ['teststudent@college.edu', 'testadmin@college.edu'] } });

    // 1. Test Student Registration
    console.log('[Test 1] Testing Student Registration (POST /api/auth/register)...');
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arun Kumar',
        registerNumber: '710021104001',
        email: 'teststudent@college.edu',
        department: 'Computer Science and Engineering',
        year: '3rd Year',
        password: 'Password@123'
      })
    });
    const regData = await regRes.json();
    console.log(` -> Status: ${regRes.status} | Success: ${regData.success} | Has Token: ${!!regData.token}`);
    if (regRes.status !== 201 || !regData.token) throw new Error('Registration failed');

    // 2. Test Duplicate Prevention
    console.log('\n[Test 2] Testing Duplicate Registration Prevention...');
    const dupRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Arun',
        registerNumber: '710021104001',
        email: 'teststudent@college.edu',
        department: 'Computer Science and Engineering',
        year: '3rd Year',
        password: 'Password@123'
      })
    });
    const dupData = await dupRes.json();
    console.log(` -> Status: ${dupRes.status} (Expected 400) | Message: ${dupData.message}`);
    if (dupRes.status !== 400) throw new Error('Duplicate check failed');

    // 3. Test Student Login (Valid Credentials)
    console.log('\n[Test 3] Testing Login with Correct Credentials (POST /api/auth/login)...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teststudent@college.edu',
        password: 'Password@123'
      })
    });
    const loginData = await loginRes.json();
    console.log(` -> Status: ${loginRes.status} | Role: ${loginData.user?.role} | Token: Received`);
    if (loginRes.status !== 200 || !loginData.token) throw new Error('Login failed');
    const studentToken = loginData.token;

    // 4. Test Student Login (Invalid Password)
    console.log('\n[Test 4] Testing Login with Incorrect Password...');
    const failLoginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teststudent@college.edu',
        password: 'WrongPassword999'
      })
    });
    const failLoginData = await failLoginRes.json();
    console.log(` -> Status: ${failLoginRes.status} (Expected 401) | Message: ${failLoginData.message}`);
    if (failLoginRes.status !== 401) throw new Error('Invalid password check failed');

    // 5. Test Protected Profile Route with Token
    console.log('\n[Test 5] Testing Protected Profile (GET /api/auth/profile with Bearer Token)...');
    const profRes = await fetch('http://localhost:5000/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const profData = await profRes.json();
    console.log(` -> Status: ${profRes.status} | User: ${profData.user?.name} | RegNo: ${profData.user?.registerNumber}`);
    if (profRes.status !== 200 || profData.user?.name !== 'Arun Kumar') throw new Error('Profile retrieval failed');

    // 6. Test Protected Route without Token
    console.log('\n[Test 6] Testing Protected Profile without Token...');
    const noTokenRes = await fetch('http://localhost:5000/api/auth/profile');
    const noTokenData = await noTokenRes.json();
    console.log(` -> Status: ${noTokenRes.status} (Expected 401) | Message: ${noTokenData.message}`);
    if (noTokenRes.status !== 401) throw new Error('No-token check failed');

    // Cleanup
    await User.deleteMany({ email: { $in: ['teststudent@college.edu', 'testadmin@college.edu'] } });
    console.log('\n✅ ALL AUTHENTICATION AND ROLE TESTS PASSED SUCCESSFULLY!\n');

    server.close(async () => {
      await mongoose.connection.close(false);
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    server.close(async () => {
      await mongoose.connection.close(false);
      process.exit(1);
    });
  }
}

// Allow server to listen then run
setTimeout(runAuthTests, 1500);
