import axios from 'axios';
import { INITIAL_USERS, INITIAL_COMPLAINTS } from './mockData';

const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: inject JWT Bearer token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('netcare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('netcare_token');
        localStorage.removeItem('netcare_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Local Storage Mock Adapter for GitHub Pages Demo
const getStoredComplaints = () => {
  try {
    const stored = localStorage.getItem('netcare_mock_complaints');
    if (!stored) {
      localStorage.setItem('netcare_mock_complaints', JSON.stringify(INITIAL_COMPLAINTS));
      return INITIAL_COMPLAINTS;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_COMPLAINTS;
  }
};

const saveStoredComplaints = (list) => {
  localStorage.setItem('netcare_mock_complaints', JSON.stringify(list));
};

const getStoredUsers = () => {
  try {
    const stored = localStorage.getItem('netcare_mock_users');
    if (!stored) {
      localStorage.setItem('netcare_mock_users', JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_USERS;
  }
};

const DFA_RULES = {
  S0: { REVIEW: { toState: 'S1', toStatus: 'Under Review' }, REJECT: { toState: 'S6', toStatus: 'Rejected' } },
  S1: { ASSIGN: { toState: 'S2', toStatus: 'Assigned to Technician' }, REJECT: { toState: 'S6', toStatus: 'Rejected' } },
  S2: { START_WORK: { toState: 'S3', toStatus: 'Work In Progress' } },
  S3: { RESOLVE: { toState: 'S4', toStatus: 'Resolved' } },
  S4: { CLOSE: { toState: 'S5', toStatus: 'Closed' }, REOPEN: { toState: 'S2', toStatus: 'Assigned to Technician' } }
};

const getAllowed = (state) => {
  const rules = DFA_RULES[state] || {};
  return Object.keys(rules).map((symbol) => ({
    inputSymbol: symbol,
    nextState: rules[symbol].toState,
    nextStatus: rules[symbol].toStatus
  }));
};

// Safe wrapper that tries API first; if on GitHub Pages or if API fails, uses Mock Storage!
const withFallback = async (apiCall, fallbackCall) => {
  if (isGitHubPages) {
    return fallbackCall();
  }
  try {
    return await apiCall();
  } catch (err) {
    if (!err.response || err.code === 'ERR_NETWORK') {
      console.info('Backend unreachable, falling back to local client store.');
      return fallbackCall();
    }
    throw err;
  }
};

// Auth Service
export const authService = {
  register: (data) =>
    withFallback(
      () => API.post('/auth/register', data),
      () => {
        const users = getStoredUsers();
        const newUser = {
          id: `usr_${Date.now()}`,
          name: data.name,
          registerNumber: data.registerNumber.toUpperCase(),
          email: data.email.toLowerCase(),
          department: data.department,
          year: data.year,
          role: 'student',
          createdAt: new Date()
        };
        users.push(newUser);
        localStorage.setItem('netcare_mock_users', JSON.stringify(users));
        return {
          data: {
            success: true,
            token: `mock_jwt_${Date.now()}`,
            user: newUser
          }
        };
      }
    ),

  login: (data) =>
    withFallback(
      () => API.post('/auth/login', data),
      () => {
        const users = getStoredUsers();
        const user = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
        if (!user) {
          throw new Error('User not found. Try one of the quick fill accounts.');
        }
        return {
          data: {
            success: true,
            token: `mock_jwt_${Date.now()}`,
            user
          }
        };
      }
    ),

  getProfile: () =>
    withFallback(
      () => API.get('/auth/profile'),
      () => {
        const saved = localStorage.getItem('netcare_user');
        const user = saved ? JSON.parse(saved) : INITIAL_USERS[0];
        return { data: { success: true, user } };
      }
    )
};

// Complaint Service
export const complaintService = {
  create: (data) =>
    withFallback(
      () => API.post('/complaints', data),
      () => {
        const complaints = getStoredComplaints();
        const savedUser = JSON.parse(localStorage.getItem('netcare_user') || '{}');
        const newComplaint = {
          _id: `cmp_${Date.now()}`,
          complaintId: `NET-2026-${String(complaints.length + 1).padStart(4, '0')}`,
          studentId: savedUser.id || 'usr_student_1',
          studentSnapshot: {
            name: savedUser.name || 'Arun Kumar',
            registerNumber: savedUser.registerNumber || '710021104001',
            email: savedUser.email || 'arun.kumar@college.edu',
            department: savedUser.department || 'Computer Science and Engineering',
            year: savedUser.year || '3rd Year'
          },
          category: data.category,
          networkType: data.networkType,
          location: data.location,
          locationDetails: data.locationDetails || '',
          description: data.description,
          priority: data.priority || 'Medium',
          currentState: 'S0',
          status: 'Complaint Registered',
          assignedTechnician: { name: 'Unassigned' },
          createdAt: new Date(),
          updatedAt: new Date(),
          transitionHistory: [
            {
              fromState: 'START',
              inputSymbol: 'SUBMIT',
              toState: 'S0',
              performedByName: savedUser.name || 'Student',
              performedByRole: 'student',
              remarks: 'Complaint submitted into NetCare portal.',
              timestamp: new Date()
            }
          ]
        };
        complaints.unshift(newComplaint);
        saveStoredComplaints(complaints);
        return {
          data: {
            success: true,
            complaint: { ...newComplaint, allowedTransitions: getAllowed('S0') }
          }
        };
      }
    ),

  getMyComplaints: (params) =>
    withFallback(
      () => API.get('/complaints/my', { params }),
      () => {
        const complaints = getStoredComplaints();
        const savedUser = JSON.parse(localStorage.getItem('netcare_user') || '{}');
        let list = savedUser.role === 'admin' ? complaints : complaints.filter((c) => c.studentSnapshot?.email === savedUser.email || c.studentId === savedUser.id);
        if (list.length === 0) list = complaints.slice(0, 3); // Fallback to ensure rich demo

        if (params?.status && params.status !== 'ALL') {
          list = list.filter((c) => c.currentState === params.status);
        }
        if (params?.priority && params.priority !== 'ALL') {
          list = list.filter((c) => c.priority === params.priority);
        }
        return {
          data: {
            success: true,
            count: list.length,
            complaints: list.map((c) => ({ ...c, allowedTransitions: getAllowed(c.currentState) }))
          }
        };
      }
    ),

  getAllComplaints: (params) =>
    withFallback(
      () => API.get('/complaints', { params }),
      () => {
        let list = getStoredComplaints();
        if (params?.status && params.status !== 'ALL') list = list.filter((c) => c.currentState === params.status);
        if (params?.priority && params.priority !== 'ALL') list = list.filter((c) => c.priority === params.priority);
        if (params?.department && params.department !== 'ALL') list = list.filter((c) => c.studentSnapshot?.department === params.department);
        if (params?.networkType && params.networkType !== 'ALL') list = list.filter((c) => c.networkType === params.networkType);
        if (params?.search) {
          const s = params.search.toLowerCase();
          list = list.filter(
            (c) =>
              c.complaintId.toLowerCase().includes(s) ||
              c.studentSnapshot?.name?.toLowerCase().includes(s) ||
              c.description.toLowerCase().includes(s)
          );
        }
        return {
          data: {
            success: true,
            count: list.length,
            complaints: list.map((c) => ({ ...c, allowedTransitions: getAllowed(c.currentState) }))
          }
        };
      }
    ),

  getById: (id) =>
    withFallback(
      () => API.get(`/complaints/${id}`),
      () => {
        const complaints = getStoredComplaints();
        const found = complaints.find((c) => c.complaintId === id || c._id === id);
        if (!found) throw new Error('Complaint not found.');
        return {
          data: {
            success: true,
            complaint: { ...found, allowedTransitions: getAllowed(found.currentState) }
          }
        };
      }
    ),

  executeTransition: (id, data) =>
    withFallback(
      () => API.post(`/complaints/${id}/transition`, data),
      () => {
        const complaints = getStoredComplaints();
        const index = complaints.findIndex((c) => c.complaintId === id || c._id === id);
        if (index === -1) throw new Error('Complaint not found.');

        const complaint = complaints[index];
        const rule = DFA_RULES[complaint.currentState]?.[data.inputSymbol];
        if (!rule) {
          throw new Error(`Invalid DFA transition δ(${complaint.currentState}, ${data.inputSymbol})`);
        }

        const savedUser = JSON.parse(localStorage.getItem('netcare_user') || '{}');
        const prev = complaint.currentState;
        complaint.currentState = rule.toState;
        complaint.status = rule.toStatus;
        complaint.updatedAt = new Date();

        if (data.inputSymbol === 'RESOLVE' && data.remarks) {
          complaint.resolutionRemarks = data.remarks;
        }

        complaint.transitionHistory.push({
          fromState: prev,
          inputSymbol: data.inputSymbol,
          toState: rule.toState,
          performedByName: savedUser.name || 'User',
          performedByRole: savedUser.role || 'admin',
          remarks: data.remarks || `Executed δ(${prev}, ${data.inputSymbol}) → ${rule.toState}`,
          timestamp: new Date()
        });

        complaints[index] = complaint;
        saveStoredComplaints(complaints);

        return {
          data: {
            success: true,
            message: `Transition δ(${prev}, ${data.inputSymbol}) → ${complaint.currentState} executed.`,
            complaint: { ...complaint, allowedTransitions: getAllowed(complaint.currentState) }
          }
        };
      }
    ),

  getHistory: (id) =>
    withFallback(
      () => API.get(`/complaints/${id}/history`),
      () => {
        const complaints = getStoredComplaints();
        const found = complaints.find((c) => c.complaintId === id || c._id === id);
        return {
          data: {
            success: true,
            complaintId: found?.complaintId || id,
            historyCount: found?.transitionHistory?.length || 0,
            history: found?.transitionHistory || []
          }
        };
      }
    ),

  cancel: (id) =>
    withFallback(
      () => API.post(`/complaints/${id}/cancel`),
      () => {
        return complaintService.executeTransition(id, { inputSymbol: 'REJECT', remarks: 'Cancelled by student' });
      }
    )
};

// Admin Service
export const adminService = {
  getDashboard: () =>
    withFallback(
      () => API.get('/admin/dashboard'),
      () => {
        const complaints = getStoredComplaints();
        const s0 = complaints.filter((c) => c.currentState === 'S0').length;
        const s1 = complaints.filter((c) => c.currentState === 'S1').length;
        const s2 = complaints.filter((c) => c.currentState === 'S2').length;
        const s3 = complaints.filter((c) => c.currentState === 'S3').length;
        const s4 = complaints.filter((c) => c.currentState === 'S4').length;
        const s5 = complaints.filter((c) => c.currentState === 'S5').length;
        const s6 = complaints.filter((c) => c.currentState === 'S6').length;

        const high = complaints.filter((c) => c.priority === 'High').length;
        const medium = complaints.filter((c) => c.priority === 'Medium').length;
        const low = complaints.filter((c) => c.priority === 'Low').length;

        return {
          data: {
            success: true,
            stats: {
              total: complaints.length,
              newComplaints: s0,
              underReview: s1,
              assigned: s2,
              inProgress: s3,
              resolved: s4,
              closed: s5,
              rejected: s6,
              active: s0 + s1 + s2 + s3
            },
            stateDistribution: [
              { state: 'S0', name: 'Complaint Registered', count: s0, color: '#3b82f6' },
              { state: 'S1', name: 'Under Review', count: s1, color: '#8b5cf6' },
              { state: 'S2', name: 'Assigned to Technician', count: s2, color: '#f59e0b' },
              { state: 'S3', name: 'Work In Progress', count: s3, color: '#06b6d4' },
              { state: 'S4', name: 'Resolved', count: s4, color: '#10b981' },
              { state: 'S5', name: 'Closed', count: s5, color: '#059669' },
              { state: 'S6', name: 'Rejected', count: s6, color: '#ef4444' }
            ],
            priorityDistribution: [
              { priority: 'High', count: high, color: '#ef4444' },
              { priority: 'Medium', count: medium, color: '#f59e0b' },
              { priority: 'Low', count: low, color: '#10b981' }
            ],
            departmentDistribution: [
              { department: 'Computer Science and Engineering', count: 3 },
              { department: 'Information Technology', count: 2 },
              { department: 'Electronics and Communication Engineering', count: 2 },
              { department: 'Cyber Security', count: 2 }
            ],
            recentComplaints: complaints.slice(0, 6).map((c) => ({ ...c, allowedTransitions: getAllowed(c.currentState) })),
            technicians: [
              { id: 'TECH-01', name: 'R. Rajesh', phone: '+91 98401 23456', email: 'rajesh.net@college.edu', specialization: 'Campus Wi-Fi & APs' },
              { id: 'TECH-02', name: 'M. Suresh', phone: '+91 98402 34567', email: 'suresh.lan@college.edu', specialization: 'Structured Cabling & LAN' },
              { id: 'TECH-03', name: 'K. Anitha', phone: '+91 98403 45678', email: 'anitha.auth@college.edu', specialization: 'RADIUS & Firewall Auth' },
              { id: 'TECH-04', name: 'V. Prakash', phone: '+91 98404 56789', email: 'prakash.infra@college.edu', specialization: 'Core Switching & Routing' }
            ]
          }
        };
      }
    ),

  getComplaints: (params) => complaintService.getAllComplaints(params),

  assignTechnician: (id, data) =>
    withFallback(
      () => API.put(`/admin/complaints/${id}/assign`, data),
      () => {
        const complaints = getStoredComplaints();
        const index = complaints.findIndex((c) => c.complaintId === id || c._id === id);
        if (index === -1) throw new Error('Complaint not found.');

        const complaint = complaints[index];
        complaint.assignedTechnician = {
          name: data.technicianName,
          phone: data.technicianPhone || '+91 98400 00000',
          email: data.technicianEmail || 'support@college.edu',
          assignedAt: new Date()
        };

        if (complaint.currentState === 'S1') {
          complaint.currentState = 'S2';
          complaint.status = 'Assigned to Technician';
          complaint.transitionHistory.push({
            fromState: 'S1',
            inputSymbol: 'ASSIGN',
            toState: 'S2',
            performedByName: 'Dr. K. Ramanathan',
            performedByRole: 'admin',
            remarks: data.remarks || `Assigned to ${data.technicianName}`,
            timestamp: new Date()
          });
        }

        complaints[index] = complaint;
        saveStoredComplaints(complaints);
        return {
          data: {
            success: true,
            message: `Technician ${data.technicianName} assigned to ${complaint.complaintId}.`,
            complaint: { ...complaint, allowedTransitions: getAllowed(complaint.currentState) }
          }
        };
      }
    )
};

// DFA Service
export const dfaService = {
  getStates: () => API.get('/dfa/states'),
  getTransitions: () => API.get('/dfa/transitions'),
  getStateAllowed: (stateId) => API.get(`/dfa/states/${stateId}/allowed`)
};

export default API;
