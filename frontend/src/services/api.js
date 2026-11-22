import axios from 'axios';

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

// Response interceptor: handle token expiration or 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login or register failure
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

// Auth Service
export const authService = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/profile')
};

// Complaint Service
export const complaintService = {
  create: (data) => API.post('/complaints', data),
  getMyComplaints: (params) => API.get('/complaints/my', { params }),
  getAllComplaints: (params) => API.get('/complaints', { params }),
  getById: (id) => API.get(`/complaints/${id}`),
  executeTransition: (id, data) => API.post(`/complaints/${id}/transition`, data),
  getHistory: (id) => API.get(`/complaints/${id}/history`),
  cancel: (id) => API.post(`/complaints/${id}/cancel`)
};

// Admin Service
export const adminService = {
  getDashboard: () => API.get('/admin/dashboard'),
  getComplaints: (params) => API.get('/admin/complaints', { params }),
  assignTechnician: (id, data) => API.put(`/admin/complaints/${id}/assign`, data)
};

// DFA Service
export const dfaService = {
  getStates: () => API.get('/dfa/states'),
  getTransitions: () => API.get('/dfa/transitions'),
  getStateAllowed: (stateId) => API.get(`/dfa/states/${stateId}/allowed`)
};

export default API;
