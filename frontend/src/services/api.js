// frontend/src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', config.method.toUpperCase(), config.url, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token expiration
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', response.status, response.data);
    }
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network Error: Cannot connect to server');
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  getProfile: () => api.get('/auth/profile')
};

// Attendance APIs
export const attendanceAPI = {
  // Employee endpoints
  checkIn: () => {
    console.log('📍 Calling checkIn API...');
    return api.post('/attendance/checkin');
  },
  
  checkOut: () => {
    console.log('📍 Calling checkOut API...');
    return api.post('/attendance/checkout');
  },
  
  getTodayStatus: () => {
    console.log('📍 Calling getTodayStatus API...');
    return api.get('/attendance/today');
  },
  
  getMyHistory: (params) => {
    console.log('📍 Calling getMyHistory API with params:', params);
    return api.get('/attendance/my-history', { params });
  },
  
  getMySummary: (params) => {
    return api.get('/attendance/my-summary', { params });
  },
  
  // Manager endpoints
  getAllAttendance: (params) => {
    return api.get('/attendance/all', { params });
  },
  
  getEmployeeAttendance: (id, params) => {
    return api.get(`/attendance/employee/${id}`, { params });
  },
  
  getTeamSummary: (params) => {
    return api.get('/attendance/summary', { params });
  },
  
  getTodayTeamStatus: () => {
    return api.get('/attendance/today-status');
  },
  
  exportAttendance: (params) => {
    return api.get('/attendance/export', { 
      params,
      responseType: 'json' // Changed from 'blob' to 'json' to match backend
    });
  }
};

// Dashboard APIs
export const dashboardAPI = {
  getEmployeeDashboard: () => api.get('/dashboard/employee'),
  getManagerDashboard: () => api.get('/dashboard/manager'),
  getEmployeeStats: () => api.get('/dashboard/employee/stats'),
  getManagerStats: () => api.get('/dashboard/manager/stats'),
  getTeamAttendance: (params) => api.get('/dashboard/manager/team-attendance', { params }),
  getDepartmentStats: () => api.get('/dashboard/manager/department-stats')
};

// Helper function to handle API errors
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'No response from server. Please check your connection.',
      status: 0
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1
    };
  }
};

// Test connection function
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ Server connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Server connection failed:', error);
    return { success: false, error: handleAPIError(error) };
  }
};

export default api;