import axios from "axios";

// Use separate token key for Lawyer to avoid conflicts with other roles
const LAWYER_TOKEN_KEY = "lawyerToken";

// Use environment variable or default to Laravel API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/lawyer`,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(LAWYER_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If data is FormData, remove Content-Type header to let browser set it
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
      const isLawyerRoute = currentPath.startsWith('/lawyer');
      
      // Only redirect if we're on a lawyer route, not already redirecting
      if (isLawyerRoute && !isRedirecting) {
        isRedirecting = true;
        removeToken();
        // Use setTimeout to avoid redirect during render
        setTimeout(() => {
          window.location.href = '/lawyer/login';
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export const getToken = () => localStorage.getItem(LAWYER_TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(LAWYER_TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(LAWYER_TOKEN_KEY);

