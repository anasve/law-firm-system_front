import axios from "axios";
import { API_BASE_URL, TOKEN_KEY } from "../constants";

// Create axios instance with base config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If data is FormData, remove Content-Type to let browser set it automatically with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track if we're already redirecting to avoid multiple redirects
let isRedirecting = false;

// Add response interceptor to handle 401 errors and log network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log network errors with more details (but not 404 errors)
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED' || error.message?.includes('Network Error')) {
      console.error('Network Error - API Server may be down:', {
        message: error.message,
        code: error.code,
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
        hint: 'Make sure the Laravel backend server is running on http://localhost:8000',
      });
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request Timeout:', {
        message: error.message,
        timeout: error.config?.timeout,
        url: error.config?.url,
      });
    }
    // Don't log 404 errors - they're expected if endpoints aren't implemented yet
    
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      const currentPath = window.location.pathname;
      const isAdminRoute = currentPath.startsWith('/admin') || currentPath.startsWith('/dashboard');
      
      // Only redirect if we're on an admin route, not already redirecting, and not on login
      if (isAdminRoute && !isRedirecting && !currentPath.includes('/login')) {
        isRedirecting = true;
        removeToken();
        // Use setTimeout to avoid redirect during render
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to get token
export const getToken = () => localStorage.getItem(TOKEN_KEY);

// Helper function to set token
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

// Helper function to remove token
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

