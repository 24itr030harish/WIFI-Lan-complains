// Fallback seed data for GitHub Pages static deployment
export const INITIAL_USERS = [
  {
    id: 'usr_admin',
    name: 'Dr. K. Ramanathan',
    registerNumber: 'ADMIN-001',
    email: 'admin@college.edu',
    department: 'Network Administration / IT Support',
    year: 'Faculty / Staff',
    role: 'admin',
    createdAt: new Date()
  },
  {
    id: 'usr_student_1',
    name: 'Arun Kumar',
    registerNumber: '710021104001',
    email: 'arun.kumar@college.edu',
    department: 'Computer Science and Engineering',
    year: '3rd Year',
    role: 'student',
    createdAt: new Date()
  },
  {
    id: 'usr_student_2',
    name: 'Priya Sharma',
    registerNumber: '710021104002',
    email: 'priya.sharma@college.edu',
    department: 'Information Technology',
    year: '2nd Year',
    role: 'student',
    createdAt: new Date()
  },
  {
    id: 'usr_student_3',
    name: 'Karthik Raja',
    registerNumber: '710021104003',
    email: 'karthik.raja@college.edu',
    department: 'Electronics and Communication Engineering',
    year: '4th Year',
    role: 'student',
    createdAt: new Date()
  },
  {
    id: 'usr_student_4',
    name: 'Divya Lakshmi',
    registerNumber: '710021104004',
    email: 'divya.lakshmi@college.edu',
    department: 'Artificial Intelligence & Data Science',
    year: '1st Year',
    role: 'student',
    createdAt: new Date()
  },
  {
    id: 'usr_student_5',
    name: 'Mohammed Faizal',
    registerNumber: '710021104005',
    email: 'mohammed.faizal@college.edu',
    department: 'Cyber Security',
    year: '3rd Year',
    role: 'student',
    createdAt: new Date()
  }
];

export const INITIAL_COMPLAINTS = [
  {
    _id: 'cmp_1',
    complaintId: 'NET-2026-0001',
    studentId: 'usr_student_1',
    studentSnapshot: {
      name: 'Arun Kumar',
      registerNumber: '710021104001',
      email: 'arun.kumar@college.edu',
      department: 'Computer Science and Engineering',
      year: '3rd Year'
    },
    category: 'Wi-Fi Not Connecting',
    networkType: 'Wi-Fi',
    location: 'Hostel',
    locationDetails: 'Room 204, Kaveri Hostel Block B',
    description: 'Hostel-Secure Wi-Fi disconnects repeatedly every 5 minutes when connecting from room 204.',
    priority: 'Medium',
    currentState: 'S0',
    status: 'Complaint Registered',
    assignedTechnician: { name: 'Unassigned' },
    createdAt: new Date(Date.now() - 3600000 * 2),
    updatedAt: new Date(Date.now() - 3600000 * 2),
    transitionHistory: [
      {
        fromState: 'START',
        inputSymbol: 'SUBMIT',
        toState: 'S0',
        performedByName: 'Arun Kumar',
        performedByRole: 'student',
        remarks: 'Complaint registered by student into NetCare portal.',
        timestamp: new Date(Date.now() - 3600000 * 2)
      }
    ]
  },
  {
    _id: 'cmp_2',
    complaintId: 'NET-2026-0002',
    studentId: 'usr_student_2',
    studentSnapshot: {
      name: 'Priya Sharma',
      registerNumber: '710021104002',
      email: 'priya.sharma@college.edu',
      department: 'Information Technology',
      year: '2nd Year'
    },
    category: 'Slow Internet',
    networkType: 'Wi-Fi',
    location: 'Library',
    locationDetails: 'Central Library 2nd Floor Reference Section',
    description: 'Speedtest results show < 1 Mbps download bandwidth during peak afternoon study hours.',
    priority: 'High',
    currentState: 'S1',
    status: 'Under Review',
    assignedTechnician: { name: 'Unassigned' },
    createdAt: new Date(Date.now() - 3600000 * 12),
    updatedAt: new Date(Date.now() - 3600000 * 10),
    transitionHistory: [
      {
        fromState: 'START',
        inputSymbol: 'SUBMIT',
        toState: 'S0',
        performedByName: 'Priya Sharma',
        performedByRole: 'student',
        remarks: 'Complaint registered.',
        timestamp: new Date(Date.now() - 3600000 * 12)
      },
      {
        fromState: 'S0',
        inputSymbol: 'REVIEW',
        toState: 'S1',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Admin verified bandwidth saturation logs with library network monitor.',
        timestamp: new Date(Date.now() - 3600000 * 10)
      }
    ]
  },
  {
    _id: 'cmp_3',
    complaintId: 'NET-2026-0003',
    studentId: 'usr_student_3',
    studentSnapshot: {
      name: 'Karthik Raja',
      registerNumber: '710021104003',
      email: 'karthik.raja@college.edu',
      department: 'Electronics and Communication Engineering',
      year: '4th Year'
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
    createdAt: new Date(Date.now() - 3600000 * 20),
    updatedAt: new Date(Date.now() - 3600000 * 8),
    transitionHistory: [
      {
        fromState: 'START',
        inputSymbol: 'SUBMIT',
        toState: 'S0',
        performedByName: 'Karthik Raja',
        performedByRole: 'student',
        remarks: 'Submitted by student.',
        timestamp: new Date(Date.now() - 3600000 * 20)
      },
      {
        fromState: 'S0',
        inputSymbol: 'REVIEW',
        toState: 'S1',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Verified patch panel mapping.',
        timestamp: new Date(Date.now() - 3600000 * 18)
      },
      {
        fromState: 'S1',
        inputSymbol: 'ASSIGN',
        toState: 'S2',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Assigned to structured cabling specialist M. Suresh.',
        timestamp: new Date(Date.now() - 3600000 * 8)
      }
    ]
  },
  {
    _id: 'cmp_4',
    complaintId: 'NET-2026-0004',
    studentId: 'usr_student_4',
    studentSnapshot: {
      name: 'Divya Lakshmi',
      registerNumber: '710021104004',
      email: 'divya.lakshmi@college.edu',
      department: 'Artificial Intelligence & Data Science',
      year: '1st Year'
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
    createdAt: new Date(Date.now() - 3600000 * 15),
    updatedAt: new Date(Date.now() - 3600000 * 2),
    transitionHistory: [
      {
        fromState: 'START',
        inputSymbol: 'SUBMIT',
        toState: 'S0',
        performedByName: 'Divya Lakshmi',
        performedByRole: 'student',
        remarks: 'Submitted.',
        timestamp: new Date(Date.now() - 3600000 * 15)
      },
      {
        fromState: 'S0',
        inputSymbol: 'REVIEW',
        toState: 'S1',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Reviewed and prioritized as High.',
        timestamp: new Date(Date.now() - 3600000 * 10)
      },
      {
        fromState: 'S1',
        inputSymbol: 'ASSIGN',
        toState: 'S2',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Assigned to Wi-Fi specialist R. Rajesh.',
        timestamp: new Date(Date.now() - 3600000 * 6)
      },
      {
        fromState: 'S2',
        inputSymbol: 'START_WORK',
        toState: 'S3',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Technician on-site testing AP uplink cable and VLAN tags.',
        timestamp: new Date(Date.now() - 3600000 * 2)
      }
    ]
  },
  {
    _id: 'cmp_5',
    complaintId: 'NET-2026-0005',
    studentId: 'usr_student_5',
    studentSnapshot: {
      name: 'Mohammed Faizal',
      registerNumber: '710021104005',
      email: 'mohammed.faizal@college.edu',
      department: 'Cyber Security',
      year: '3rd Year'
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
    createdAt: new Date(Date.now() - 3600000 * 30),
    updatedAt: new Date(Date.now() - 3600000 * 4),
    transitionHistory: [
      {
        fromState: 'START',
        inputSymbol: 'SUBMIT',
        toState: 'S0',
        performedByName: 'Mohammed Faizal',
        performedByRole: 'student',
        remarks: 'Ticket filed.',
        timestamp: new Date(Date.now() - 3600000 * 30)
      },
      {
        fromState: 'S0',
        inputSymbol: 'REVIEW',
        toState: 'S1',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Reviewed auth logs.',
        timestamp: new Date(Date.now() - 3600000 * 28)
      },
      {
        fromState: 'S1',
        inputSymbol: 'ASSIGN',
        toState: 'S2',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Assigned to K. Anitha.',
        timestamp: new Date(Date.now() - 3600000 * 24)
      },
      {
        fromState: 'S2',
        inputSymbol: 'START_WORK',
        toState: 'S3',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Auditing Active Directory LDAP bind credentials.',
        timestamp: new Date(Date.now() - 3600000 * 20)
      },
      {
        fromState: 'S3',
        inputSymbol: 'RESOLVE',
        toState: 'S4',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Synchronized RADIUS LDAP certificate and refreshed student group policy. Verified login.',
        timestamp: new Date(Date.now() - 3600000 * 4)
      }
    ]
  },
  {
    _id: 'cmp_6',
    complaintId: 'NET-2026-0006',
    studentId: 'usr_student_1',
    studentSnapshot: {
      name: 'Arun Kumar',
      registerNumber: '710021104001',
      email: 'arun.kumar@college.edu',
      department: 'Computer Science and Engineering',
      year: '3rd Year'
    },
    category: 'LAN Connectivity Issue',
    networkType: 'LAN',
    location: 'Laboratory',
    locationDetails: 'CSE Project Lab Desk #08',
    description: 'Damaged RJ-45 clip on patch cord causing intermittent packet loss.',
    priority: 'Low',
    currentState: 'S5',
    status: 'Closed',
    assignedTechnician: { name: 'M. Suresh' },
    resolutionRemarks: 'Re-crimped Cat6 cable with new shielded RJ45 modular jack. 0% packet loss measured.',
    createdAt: new Date(Date.now() - 3600000 * 50),
    updatedAt: new Date(Date.now() - 3600000 * 20),
    transitionHistory: [
      {
        fromState: 'START',
        inputSymbol: 'SUBMIT',
        toState: 'S0',
        performedByName: 'Arun Kumar',
        performedByRole: 'student',
        remarks: 'Reported cable issue.',
        timestamp: new Date(Date.now() - 3600000 * 50)
      },
      {
        fromState: 'S0',
        inputSymbol: 'REVIEW',
        toState: 'S1',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Triaged.',
        timestamp: new Date(Date.now() - 3600000 * 49)
      },
      {
        fromState: 'S1',
        inputSymbol: 'ASSIGN',
        toState: 'S2',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Assigned to M. Suresh.',
        timestamp: new Date(Date.now() - 3600000 * 48)
      },
      {
        fromState: 'S2',
        inputSymbol: 'START_WORK',
        toState: 'S3',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Re-terminating cable.',
        timestamp: new Date(Date.now() - 3600000 * 40)
      },
      {
        fromState: 'S3',
        inputSymbol: 'RESOLVE',
        toState: 'S4',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Re-crimped Cat6 cable with new shielded RJ45 modular jack. 0% packet loss measured.',
        timestamp: new Date(Date.now() - 3600000 * 30)
      },
      {
        fromState: 'S4',
        inputSymbol: 'CLOSE',
        toState: 'S5',
        performedByName: 'Arun Kumar',
        performedByRole: 'student',
        remarks: 'Confirmed connection is stable now. Thank you!',
        timestamp: new Date(Date.now() - 3600000 * 20)
      }
    ]
  },
  {
    _id: 'cmp_7',
    complaintId: 'NET-2026-0007',
    studentId: 'usr_student_2',
    studentSnapshot: {
      name: 'Priya Sharma',
      registerNumber: '710021104002',
      email: 'priya.sharma@college.edu',
      department: 'Information Technology',
      year: '2nd Year'
    },
    category: 'Wi-Fi Not Connecting',
    networkType: 'Wi-Fi',
    location: 'Seminar Hall',
    locationDetails: 'Auditorium Block Seminar Hall 2',
    description: 'Wireless Access Point AP-AUD-02 was offline during department symposium preparation.',
    priority: 'High',
    currentState: 'S5',
    status: 'Closed',
    assignedTechnician: { name: 'R. Rajesh' },
    resolutionRemarks: 'PoE switch port 18 power cycled; AP firmware updated to v4.2.1. Signal strength excellent.',
    createdAt: new Date(Date.now() - 3600000 * 75),
    updatedAt: new Date(Date.now() - 3600000 * 50),
    transitionHistory: [
      {
        fromState: 'START',
        inputSymbol: 'SUBMIT',
        toState: 'S0',
        performedByName: 'Priya Sharma',
        performedByRole: 'student',
        remarks: 'Urgent symposium ticket.',
        timestamp: new Date(Date.now() - 3600000 * 75)
      },
      {
        fromState: 'S4',
        inputSymbol: 'CLOSE',
        toState: 'S5',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Verified during mock session and closed.',
        timestamp: new Date(Date.now() - 3600000 * 50)
      }
    ]
  },
  {
    _id: 'cmp_8',
    complaintId: 'NET-2026-0008',
    studentId: 'usr_student_3',
    studentSnapshot: {
      name: 'Karthik Raja',
      registerNumber: '710021104003',
      email: 'karthik.raja@college.edu',
      department: 'Electronics and Communication Engineering',
      year: '4th Year'
    },
    category: 'Other',
    networkType: 'Wi-Fi',
    location: 'Campus Grounds',
    locationDetails: 'Near Canteen open lawn',
    description: 'Requesting private Wi-Fi access point for personal gaming tournament on weekend.',
    priority: 'Low',
    currentState: 'S6',
    status: 'Rejected',
    assignedTechnician: { name: 'Unassigned' },
    createdAt: new Date(Date.now() - 3600000 * 100),
    updatedAt: new Date(Date.now() - 3600000 * 90),
    transitionHistory: [
      {
        fromState: 'START',
        inputSymbol: 'SUBMIT',
        toState: 'S0',
        performedByName: 'Karthik Raja',
        performedByRole: 'student',
        remarks: 'Filed request.',
        timestamp: new Date(Date.now() - 3600000 * 100)
      },
      {
        fromState: 'S0',
        inputSymbol: 'REJECT',
        toState: 'S6',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Personal gaming events cannot be provisioned on academic network infrastructure.',
        timestamp: new Date(Date.now() - 3600000 * 90)
      }
    ]
  },
  {
    _id: 'cmp_9',
    complaintId: 'NET-2026-0009',
    studentId: 'usr_student_4',
    studentSnapshot: {
      name: 'Divya Lakshmi',
      registerNumber: '710021104004',
      email: 'divya.lakshmi@college.edu',
      department: 'Artificial Intelligence & Data Science',
      year: '1st Year'
    },
    category: 'Slow Internet',
    networkType: 'Wi-Fi',
    location: 'Hostel',
    locationDetails: 'Block C Common Room',
    description: 'Duplicate complaint submitted for hostel TV streaming buffer.',
    priority: 'Low',
    currentState: 'S6',
    status: 'Rejected',
    assignedTechnician: { name: 'Unassigned' },
    createdAt: new Date(Date.now() - 3600000 * 80),
    updatedAt: new Date(Date.now() - 3600000 * 60),
    transitionHistory: [
      {
        fromState: 'START',
        inputSymbol: 'SUBMIT',
        toState: 'S0',
        performedByName: 'Divya Lakshmi',
        performedByRole: 'student',
        remarks: 'Submitted.',
        timestamp: new Date(Date.now() - 3600000 * 80)
      },
      {
        fromState: 'S0',
        inputSymbol: 'REVIEW',
        toState: 'S1',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Reviewed complaint.',
        timestamp: new Date(Date.now() - 3600000 * 70)
      },
      {
        fromState: 'S1',
        inputSymbol: 'REJECT',
        toState: 'S6',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Duplicate ticket: Already logged under master incident NET-2026-0001.',
        timestamp: new Date(Date.now() - 3600000 * 60)
      }
    ]
  },
  {
    _id: 'cmp_10',
    complaintId: 'NET-2026-0010',
    studentId: 'usr_student_5',
    studentSnapshot: {
      name: 'Mohammed Faizal',
      registerNumber: '710021104005',
      email: 'mohammed.faizal@college.edu',
      department: 'Cyber Security',
      year: '3rd Year'
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
    createdAt: new Date(Date.now() - 3600000 * 48),
    updatedAt: new Date(Date.now() - 3600000 * 2),
    transitionHistory: [
      {
        fromState: 'START',
        inputSymbol: 'SUBMIT',
        toState: 'S0',
        performedByName: 'Mohammed Faizal',
        performedByRole: 'student',
        remarks: 'Reported dead zone.',
        timestamp: new Date(Date.now() - 3600000 * 48)
      },
      {
        fromState: 'S0',
        inputSymbol: 'REVIEW',
        toState: 'S1',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Reviewed.',
        timestamp: new Date(Date.now() - 3600000 * 40)
      },
      {
        fromState: 'S1',
        inputSymbol: 'ASSIGN',
        toState: 'S2',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Assigned to V. Prakash.',
        timestamp: new Date(Date.now() - 3600000 * 36)
      },
      {
        fromState: 'S2',
        inputSymbol: 'START_WORK',
        toState: 'S3',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Technician re-aligned AP directional antenna.',
        timestamp: new Date(Date.now() - 3600000 * 24)
      },
      {
        fromState: 'S3',
        inputSymbol: 'RESOLVE',
        toState: 'S4',
        performedByName: 'Dr. K. Ramanathan',
        performedByRole: 'admin',
        remarks: 'Antenna adjusted. Signal measured at -65 dBm.',
        timestamp: new Date(Date.now() - 3600000 * 12)
      },
      {
        fromState: 'S4',
        inputSymbol: 'REOPEN',
        toState: 'S2',
        performedByName: 'Mohammed Faizal',
        performedByRole: 'student',
        remarks: 'Issue recurred after 2 hours. Roaming disconnects persist near bay 4.',
        timestamp: new Date(Date.now() - 3600000 * 2)
      }
    ]
  }
];
