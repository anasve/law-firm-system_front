import axios from "axios";

// Use separate token key for Employee to avoid conflicts with other roles
const EMPLOYEE_TOKEN_KEY = "employeeToken";

export const api = axios.create({
  baseURL: import.meta.env.DEV ? "/api/employee" : "http://127.0.0.1:8000/api/employee",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(EMPLOYEE_TOKEN_KEY);
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

