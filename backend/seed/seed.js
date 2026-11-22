const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('\n===============================================');
    console.log('   SEEDING NETCARE DATABASE WITH SAMPLE DATA   ');
    console.log('===============================================\n');

    await connectDB();

    // 1. Clear existing collections
    console.log('[1/4] Clearing existing collections...');
    await User.deleteMany({});
    await Complaint.deleteMany({});
    console.log(' -> Cleaned User and Complaint collections.');

    // 2. Create Administrator Account
    console.log('\n[2/4] Creating Administrator Account...');
    const admin = await User.create({
      name: 'Dr. K. Ramanathan',
      registerNumber: 'ADMIN-001',
      email: 'admin@college.edu',
      department: 'Network Administration / IT Support',
      year: 'Faculty / Staff',
      password: 'Admin@123',
      role: 'admin'
    });
    console.log(` -> Admin created: ${admin.name} (${admin.email})`);

    // 3. Create 5 Student Accounts
    console.log('\n[3/4] Creating 5 Student Accounts...');
    const studentsData = [
      {
        name: 'Arun Kumar',
        registerNumber: '710021104001',
        email: 'arun.kumar@college.edu',
        department: 'Computer Science and Engineering',
        year: '3rd Year',
        password: 'Student@123'
      },
      {
        name: 'Priya Sharma',
        registerNumber: '710021104002',
        email: 'priya.sharma@college.edu',
        department: 'Information Technology',
        year: '2nd Year',
        password: 'Student@123'
      },
      {
        name: 'Karthik Raja',
        registerNumber: '710021104003',
        email: 'karthik.raja@college.edu',
        department: 'Electronics and Communication Engineering',
        year: '4th Year',
        password: 'Student@123'
      },
      {
        name: 'Divya Lakshmi',
        registerNumber: '710021104004',
        email: 'divya.lakshmi@college.edu',
        department: 'Artificial Intelligence & Data Science',
        year: '1st Year',
        password: 'Student@123'
      },
      {
        name: 'Mohammed Faizal',
        registerNumber: '710021104005',
        email: 'mohammed.faizal@college.edu',
        department: 'Cyber Security',
        year: '3rd Year',
        password: 'Student@123'
      }
    ];

    const students = await User.create(studentsData);
    students.forEach((s) => {
      console.log(` -> Student created: ${s.name} (${s.registerNumber}) - ${s.email}`);
    });

    const [arun, priya, karthik, divya, faizal] = students;

    // 4. Create 10 Complaints spanning all DFA states
    console.log('\n[4/4] Creating 10 Sample Complaints spanning DFA states S0 to S6...');

    const complaintsData = [
      // 1. S0: Complaint Registered (Initial state)
      {
        complaintId: 'NET-2026-0001',
        studentId: arun._id,
        studentSnapshot: {
          name: arun.name,
          registerNumber: arun.registerNumber,
          email: arun.email,
          department: arun.department,
          year: arun.year
        },
        category: 'Wi-Fi Not Connecting',
        networkType: 'Wi-Fi',
        location: 'Hostel',
        locationDetails: 'Room 204, Kaveri Hostel Block B',
        description: 'Hostel-Secure Wi-Fi disconnects repeatedly every 5 minutes when connecting from room 204.',
        priority: 'Medium',
        currentState: 'S0',
        status: 'Complaint Registered',
        transitionHistory: [
          {
            fromState: 'START',
            inputSymbol: 'SUBMIT',
            toState: 'S0',
            performedBy: arun._id,
            performedByName: arun.name,
            performedByRole: 'student',
            remarks: 'Complaint registered by student into NetCare portal.',
            timestamp: new Date(Date.now() - 3600000 * 2)
          }
        ]
      },

      // 2. S1: Under Review
      {
        complaintId: 'NET-2026-0002',
        studentId: priya._id,
        studentSnapshot: {
          name: priya.name,
          registerNumber: priya.registerNumber,
          email: priya.email,
          department: priya.department,
          year: priya.year
        },
        category: 'Slow Internet',
        networkType: 'Wi-Fi',
        location: 'Library',
        locationDetails: 'Central Library 2nd Floor Reference Section',
        description: 'Speedtest results show < 1 Mbps download bandwidth during peak afternoon study hours.',
        priority: 'High',
        currentState: 'S1',
        status: 'Under Review',
        transitionHistory: [
          {
            fromState: 'START',
            inputSymbol: 'SUBMIT',
            toState: 'S0',
            performedBy: priya._id,
            performedByName: priya.name,
            performedByRole: 'student',
            remarks: 'Complaint registered.',
            timestamp: new Date(Date.now() - 3600000 * 12)
          },
          {
            fromState: 'S0',
            inputSymbol: 'REVIEW',
            toState: 'S1',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Admin verified bandwidth saturation logs with library network monitor.',
            timestamp: new Date(Date.now() - 3600000 * 10)
          }
        ]
      },

      // 3. S2: Assigned to Technician
      {
        complaintId: 'NET-2026-0003',
        studentId: karthik._id,
        studentSnapshot: {
          name: karthik.name,
          registerNumber: karthik.registerNumber,
          email: karthik.email,
          department: karthik.department,
          year: karthik.year
        },
        category: 'LAN Connectivity Issue',
        networkType: 'LAN',
        location: 'Laboratory',
        locationDetails: 'ECE DSP Lab Desk #14',
        description: 'Ethernet wall port #D14 has no link light. LAN cable tested on adjacent port works normally.',
        priority: 'Medium',
        currentState: 'S2',
        status: 'Assigned to Technician',
        assignedTechnician: {
          name: 'M. Suresh',
          phone: '+91 98402 34567',
          email: 'suresh.lan@college.edu',
          assignedAt: new Date(Date.now() - 3600000 * 8)
        },
        transitionHistory: [
          {
            fromState: 'START',
            inputSymbol: 'SUBMIT',
            toState: 'S0',
            performedBy: karthik._id,
            performedByName: karthik.name,
            performedByRole: 'student',
            remarks: 'Submitted by student.',
            timestamp: new Date(Date.now() - 3600000 * 20)
          },
          {
            fromState: 'S0',
            inputSymbol: 'REVIEW',
            toState: 'S1',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Verified patch panel mapping.',
            timestamp: new Date(Date.now() - 3600000 * 18)
          },
          {
            fromState: 'S1',
            inputSymbol: 'ASSIGN',
            toState: 'S2',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Assigned to structured cabling specialist M. Suresh.',
            timestamp: new Date(Date.now() - 3600000 * 8)
          }
        ]
      },

      // 4. S3: Work In Progress
      {
        complaintId: 'NET-2026-0004',
        studentId: divya._id,
        studentSnapshot: {
          name: divya.name,
          registerNumber: divya.registerNumber,
          email: divya.email,
          department: divya.department,
          year: divya.year
        },
        category: 'No Internet Access',
        networkType: 'Wi-Fi',
        location: 'Classroom',
        locationDetails: 'AI Department Lecture Hall LH-04',
        description: 'Laptops connect to Campus-WiFi SSID but display "No Internet, secured". Gateway 10.10.4.1 unreachable.',
        priority: 'High',
        currentState: 'S3',
        status: 'Work In Progress',
        assignedTechnician: {
          name: 'R. Rajesh',
          phone: '+91 98401 23456',
          email: 'rajesh.net@college.edu',
          assignedAt: new Date(Date.now() - 3600000 * 6)
        },
        transitionHistory: [
          {
            fromState: 'START',
            inputSymbol: 'SUBMIT',
            toState: 'S0',
            performedBy: divya._id,
            performedByName: divya.name,
            performedByRole: 'student',
            remarks: 'Submitted.',
            timestamp: new Date(Date.now() - 3600000 * 15)
          },
          {
            fromState: 'S0',
            inputSymbol: 'REVIEW',
            toState: 'S1',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Reviewed and prioritized as High.',
            timestamp: new Date(Date.now() - 3600000 * 10)
          },
          {
            fromState: 'S1',
            inputSymbol: 'ASSIGN',
            toState: 'S2',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Assigned to Wi-Fi specialist R. Rajesh.',
            timestamp: new Date(Date.now() - 3600000 * 6)
          },
          {
            fromState: 'S2',
            inputSymbol: 'START_WORK',
            toState: 'S3',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Technician on-site testing AP uplink cable and VLAN tags.',
            timestamp: new Date(Date.now() - 3600000 * 2)
          }
        ]
      },

      // 5. S4: Resolved (Awaiting Student Confirmation)
      {
        complaintId: 'NET-2026-0005',
        studentId: faizal._id,
        studentSnapshot: {
          name: faizal.name,
          registerNumber: faizal.registerNumber,
          email: faizal.email,
          department: faizal.department,
          year: faizal.year
        },
        category: 'Network Authentication Failure',
        networkType: 'Wi-Fi',
        location: 'Laboratory',
        locationDetails: 'Cyber Lab 1, Ground Floor',
        description: 'RADIUS authentication fails with error 691 for all 3rd year Cyber Security student domain accounts.',
        priority: 'High',
        currentState: 'S4',
        status: 'Resolved',
        assignedTechnician: {
          name: 'K. Anitha',
          phone: '+91 98403 45678',
          email: 'anitha.auth@college.edu',
          assignedAt: new Date(Date.now() - 3600000 * 24)
        },
        resolutionRemarks: 'Synchronized RADIUS LDAP certificate and refreshed student group policy. Verified login.',
        transitionHistory: [
          {
            fromState: 'START',
            inputSymbol: 'SUBMIT',
            toState: 'S0',
            performedBy: faizal._id,
            performedByName: faizal.name,
            performedByRole: 'student',
            remarks: 'Ticket filed.',
            timestamp: new Date(Date.now() - 3600000 * 30)
          },
          {
            fromState: 'S0',
            inputSymbol: 'REVIEW',
            toState: 'S1',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Reviewed auth logs.',
            timestamp: new Date(Date.now() - 3600000 * 28)
          },
          {
            fromState: 'S1',
            inputSymbol: 'ASSIGN',
            toState: 'S2',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Assigned to K. Anitha.',
            timestamp: new Date(Date.now() - 3600000 * 24)
          },
          {
            fromState: 'S2',
            inputSymbol: 'START_WORK',
            toState: 'S3',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Auditing Active Directory LDAP bind credentials.',
            timestamp: new Date(Date.now() - 3600000 * 20)
          },
          {
            fromState: 'S3',
            inputSymbol: 'RESOLVE',
            toState: 'S4',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Synchronized RADIUS LDAP certificate and refreshed student group policy. Verified login.',
            timestamp: new Date(Date.now() - 3600000 * 4)
          }
        ]
      },

      // 6. S5: Closed (Accepting State)
      {
        complaintId: 'NET-2026-0006',
        studentId: arun._id,
        studentSnapshot: {
          name: arun.name,
          registerNumber: arun.registerNumber,
          email: arun.email,
          department: arun.department,
          year: arun.year
        },
        category: 'LAN Connectivity Issue',
        networkType: 'LAN',
        location: 'Laboratory',
        locationDetails: 'CSE Project Lab Desk #08',
        description: 'Damaged RJ-45 clip on patch cord causing intermittent packet loss.',
        priority: 'Low',
        currentState: 'S5',
        status: 'Closed',
        assignedTechnician: {
          name: 'M. Suresh',
          phone: '+91 98402 34567',
          email: 'suresh.lan@college.edu',
          assignedAt: new Date(Date.now() - 3600000 * 48)
        },
        resolutionRemarks: 'Re-crimped Cat6 cable with new shielded RJ45 modular jack. 0% packet loss measured.',
        transitionHistory: [
          {
            fromState: 'START',
            inputSymbol: 'SUBMIT',
            toState: 'S0',
            performedBy: arun._id,
            performedByName: arun.name,
            performedByRole: 'student',
            remarks: 'Reported cable issue.',
            timestamp: new Date(Date.now() - 3600000 * 50)
          },
          {
            fromState: 'S0',
            inputSymbol: 'REVIEW',
            toState: 'S1',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Triaged.',
            timestamp: new Date(Date.now() - 3600000 * 49)
          },
          {
            fromState: 'S1',
            inputSymbol: 'ASSIGN',
            toState: 'S2',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Assigned to M. Suresh.',
            timestamp: new Date(Date.now() - 3600000 * 48)
          },
          {
            fromState: 'S2',
            inputSymbol: 'START_WORK',
            toState: 'S3',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Re-terminating cable.',
            timestamp: new Date(Date.now() - 3600000 * 40)
          },
          {
            fromState: 'S3',
            inputSymbol: 'RESOLVE',
            toState: 'S4',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Re-crimped Cat6 cable with new shielded RJ45 modular jack. 0% packet loss measured.',
            timestamp: new Date(Date.now() - 3600000 * 30)
          },
          {
            fromState: 'S4',
            inputSymbol: 'CLOSE',
            toState: 'S5',
            performedBy: arun._id,
            performedByName: arun.name,
            performedByRole: 'student',
            remarks: 'Confirmed connection is stable now. Thank you!',
            timestamp: new Date(Date.now() - 3600000 * 20)
          }
        ]
      },

      // 7. S5: Closed (Accepting State)
      {
        complaintId: 'NET-2026-0007',
        studentId: priya._id,
        studentSnapshot: {
          name: priya.name,
          registerNumber: priya.registerNumber,
          email: priya.email,
          department: priya.department,
          year: priya.year
        },
        category: 'Wi-Fi Not Connecting',
        networkType: 'Wi-Fi',
        location: 'Seminar Hall',
        locationDetails: 'Auditorium Block Seminar Hall 2',
        description: 'Wireless Access Point AP-AUD-02 was offline during department symposium preparation.',
        priority: 'High',
        currentState: 'S5',
        status: 'Closed',
        assignedTechnician: {
          name: 'R. Rajesh',
          phone: '+91 98401 23456',
          email: 'rajesh.net@college.edu',
          assignedAt: new Date(Date.now() - 3600000 * 72)
        },
        resolutionRemarks: 'PoE switch port 18 power cycled; AP firmware updated to v4.2.1. Signal strength excellent.',
        transitionHistory: [
          {
            fromState: 'START',
            inputSymbol: 'SUBMIT',
            toState: 'S0',
            performedBy: priya._id,
            performedByName: priya.name,
            performedByRole: 'student',
            remarks: 'Urgent symposium ticket.',
            timestamp: new Date(Date.now() - 3600000 * 75)
          },
          {
            fromState: 'S0',
            inputSymbol: 'REVIEW',
            toState: 'S1',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Reviewed.',
            timestamp: new Date(Date.now() - 3600000 * 74)
          },
          {
            fromState: 'S1',
            inputSymbol: 'ASSIGN',
            toState: 'S2',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Assigned to R. Rajesh.',
            timestamp: new Date(Date.now() - 3600000 * 72)
          },
          {
            fromState: 'S2',
            inputSymbol: 'START_WORK',
            toState: 'S3',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Power cycling PoE port.',
            timestamp: new Date(Date.now() - 3600000 * 68)
          },
          {
            fromState: 'S3',
            inputSymbol: 'RESOLVE',
            toState: 'S4',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'PoE switch port 18 power cycled; AP firmware updated to v4.2.1. Signal strength excellent.',
            timestamp: new Date(Date.now() - 3600000 * 60)
          },
          {
            fromState: 'S4',
            inputSymbol: 'CLOSE',
            toState: 'S5',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Verified during mock session and closed.',
            timestamp: new Date(Date.now() - 3600000 * 50)
          }
        ]
      },

      // 8. S6: Rejected (Sink State from S0)
      {
        complaintId: 'NET-2026-0008',
        studentId: karthik._id,
        studentSnapshot: {
          name: karthik.name,
          registerNumber: karthik.registerNumber,
          email: karthik.email,
          department: karthik.department,
          year: karthik.year
        },
        category: 'Other',
        networkType: 'Wi-Fi',
        location: 'Campus Grounds',
        locationDetails: 'Near Canteen open lawn',
        description: 'Requesting private Wi-Fi access point for personal gaming tournament on weekend.',
        priority: 'Low',
        currentState: 'S6',
        status: 'Rejected',
        transitionHistory: [
          {
            fromState: 'START',
            inputSymbol: 'SUBMIT',
            toState: 'S0',
            performedBy: karthik._id,
            performedByName: karthik.name,
            performedByRole: 'student',
            remarks: 'Filed request.',
            timestamp: new Date(Date.now() - 3600000 * 100)
          },
          {
            fromState: 'S0',
            inputSymbol: 'REJECT',
            toState: 'S6',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Personal gaming events cannot be provisioned on academic network infrastructure per campus acceptable use policy.',
            timestamp: new Date(Date.now() - 3600000 * 90)
          }
        ]
      },

      // 9. S6: Rejected (Sink State from S1)
      {
        complaintId: 'NET-2026-0009',
        studentId: divya._id,
        studentSnapshot: {
          name: divya.name,
          registerNumber: divya.registerNumber,
          email: divya.email,
          department: divya.department,
          year: divya.year
        },
        category: 'Slow Internet',
        networkType: 'Wi-Fi',
        location: 'Hostel',
        locationDetails: 'Block C Common Room',
        description: 'Duplicate complaint submitted for hostel TV streaming buffer.',
        priority: 'Low',
        currentState: 'S6',
        status: 'Rejected',
        transitionHistory: [
          {
            fromState: 'START',
            inputSymbol: 'SUBMIT',
            toState: 'S0',
            performedBy: divya._id,
            performedByName: divya.name,
            performedByRole: 'student',
            remarks: 'Submitted.',
            timestamp: new Date(Date.now() - 3600000 * 80)
          },
          {
            fromState: 'S0',
            inputSymbol: 'REVIEW',
            toState: 'S1',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Reviewed complaint.',
            timestamp: new Date(Date.now() - 3600000 * 70)
          },
          {
            fromState: 'S1',
            inputSymbol: 'REJECT',
            toState: 'S6',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Duplicate ticket: Already logged under master incident NET-2026-0001.',
            timestamp: new Date(Date.now() - 3600000 * 60)
          }
        ]
      },

      // 10. S2: via REOPEN Cycle (S0 -> S1 -> S2 -> S3 -> S4 -> S2)
      {
        complaintId: 'NET-2026-0010',
        studentId: faizal._id,
        studentSnapshot: {
          name: faizal.name,
          registerNumber: faizal.registerNumber,
          email: faizal.email,
          department: faizal.department,
          year: faizal.year
        },
        category: 'Frequent Disconnection',
        networkType: 'Wi-Fi',
        location: 'Library',
        locationDetails: 'Digital Library Mezzanine Floor',
        description: 'Wi-Fi signal drops to 0 bars when walking between digital library bays.',
        priority: 'High',
        currentState: 'S2',
        status: 'Assigned to Technician',
        assignedTechnician: {
          name: 'V. Prakash',
          phone: '+91 98404 56789',
          email: 'prakash.infra@college.edu',
          assignedAt: new Date(Date.now() - 3600000 * 2)
        },
        resolutionRemarks: 'Initial AP antenna re-orientation was attempted, but user observed recurring packet drop.',
        transitionHistory: [
          {
            fromState: 'START',
            inputSymbol: 'SUBMIT',
            toState: 'S0',
            performedBy: faizal._id,
            performedByName: faizal.name,
            performedByRole: 'student',
            remarks: 'Reported dead zone.',
            timestamp: new Date(Date.now() - 3600000 * 48)
          },
          {
            fromState: 'S0',
            inputSymbol: 'REVIEW',
            toState: 'S1',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Reviewed.',
            timestamp: new Date(Date.now() - 3600000 * 40)
          },
          {
            fromState: 'S1',
            inputSymbol: 'ASSIGN',
            toState: 'S2',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Assigned to V. Prakash.',
            timestamp: new Date(Date.now() - 3600000 * 36)
          },
          {
            fromState: 'S2',
            inputSymbol: 'START_WORK',
            toState: 'S3',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Technician re-aligned AP directional antenna.',
            timestamp: new Date(Date.now() - 3600000 * 24)
          },
          {
            fromState: 'S3',
            inputSymbol: 'RESOLVE',
            toState: 'S4',
            performedBy: admin._id,
            performedByName: admin.name,
            performedByRole: 'admin',
            remarks: 'Antenna adjusted. Signal measured at -65 dBm.',
            timestamp: new Date(Date.now() - 3600000 * 12)
          },
          {
            fromState: 'S4',
            inputSymbol: 'REOPEN',
            toState: 'S2',
            performedBy: faizal._id,
            performedByName: faizal.name,
            performedByRole: 'student',
            remarks: 'Issue recurred after 2 hours. Roaming disconnects persist near bay 4.',
            timestamp: new Date(Date.now() - 3600000 * 2)
          }
        ]
      }
    ];

    const createdComplaints = await Complaint.create(complaintsData);
    console.log(` -> Created ${createdComplaints.length} complaints successfully!`);

    console.log('\n===============================================');
    console.log('   SEEDING COMPLETED SUCCESSFULLY!             ');
    console.log('===============================================');
    console.log('\nSample Test Credentials:');
    console.log('-----------------------------------------------');
    console.log('1. Administrator:');
    console.log('   Email:    admin@college.edu');
    console.log('   Password: Admin@123');
    console.log('\n2. Students:');
    console.log('   Email:    arun.kumar@college.edu       Password: Student@123');
    console.log('   Email:    priya.sharma@college.edu     Password: Student@123');
    console.log('   Email:    karthik.raja@college.edu     Password: Student@123');
    console.log('   Email:    divya.lakshmi@college.edu    Password: Student@123');
    console.log('   Email:    mohammed.faizal@college.edu  Password: Student@123');
    console.log('-----------------------------------------------\n');

    await mongoose.connection.close(false);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    await mongoose.connection.close(false);
    process.exit(1);
  }
};

seedDatabase();
