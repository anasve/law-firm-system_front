import axios from "axios";

// Use separate token key for Employee to avoid conflicts with other roles
const EMPLOYEE_TOKEN_KEY = "employeeToken";

// Use environment variable or default to Laravel API URL
const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const API_BASE_URL = BASE_API_URL;
export const API_BASE_URL_FULL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${BASE_API_URL}/employee`,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(EMPLOYEE_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If data is FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track if we're already redirecting to avoid multiple redirects
let isRedirecting = false;

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      const currentPath = window.location.pathname;
      const isEmployeeRoute = currentPath.startsWith('/employee');
      
      // Only redirect if we're on an employee route, not already redirecting, and not on login
      if (isEmployeeRoute && !isRedirecting && currentPath !== '/employee/login') {
        isRedirecting = true;
        removeToken();
        // Use setTimeout to avoid redirect during render
        setTimeout(() => {
          window.location.href = '/employee/login';
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export const getToken = () => localStorage.getItem(EMPLOYEE_TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(EMPLOYEE_TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(EMPLOYEE_TOKEN_KEY);

