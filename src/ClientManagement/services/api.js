import axios from "axios";

// Use separate token key for Client to avoid conflicts with other roles
const CLIENT_TOKEN_KEY = "clientToken";

// Create axios instance with base config
// Use environment variable or default to Laravel API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const API_BASE_URL_FULL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/client`,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(CLIENT_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      const isClientRoute = currentPath.startsWith('/client');
      
      // Only redirect if we're on a client route, not already redirecting, and not on login/register
      if (isClientRoute && !isRedirecting && currentPath !== '/login' && currentPath !== '/register') {
        isRedirecting = true;
        removeToken();
        // Use setTimeout to avoid redirect during render
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to get token
export const getToken = () => localStorage.getItem(CLIENT_TOKEN_KEY);

// Helper function to set token
export const setToken = (token) => localStorage.setItem(CLIENT_TOKEN_KEY, token);

// Helper function to remove token
export const removeToken = () => localStorage.removeItem(CLIENT_TOKEN_KEY);

